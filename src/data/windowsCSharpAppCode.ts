export const windowsCSharpCode = `// =============================================================================
// Kannada Worksheet PDF Translator & Study Guide Builder (.NET 8 WPF / Windows)
// Framework: .NET 8 / C# 12 WPF (Windows Presentation Foundation)
// PDF Generation: QuestPDF (fluent, vector-perfect, HarfBuzz complex shaping)
// =============================================================================

// Program.cs or MainWindow.xaml.cs snippet:
using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows;
using Microsoft.Win32;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace KannadaWorksheetApp
{
    public partial class MainWindow : Window
    {
        private string? _selectedPdfPath;
        private WorksheetData? _processedData;

        public MainWindow()
        {
            InitializeComponent();
            QuestPDF.Settings.License = LicenseType.Community;
        }

        private void BtnBrowse_Click(object sender, RoutedEventArgs e)
        {
            var dlg = new OpenFileDialog
            {
                Filter = "PDF Files (*.pdf)|*.pdf|Image Files (*.png;*.jpg)|*.png;*.jpg",
                Title = "Select Kannada Worksheet PDF"
            };
            if (dlg.ShowDialog() == true)
            {
                _selectedPdfPath = dlg.FileName;
                LblSelectedFile.Text = Path.GetFileName(_selectedPdfPath);
            }
        }

        private async void BtnProcess_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrEmpty(_selectedPdfPath))
            {
                MessageBox.Show("Please select a Kannada PDF first.", "Notice");
                return;
            }

            ProgressBar.Visibility = Visibility.Visible;
            StatusText.Text = "Sending page image to Gemini Vision for high-precision Kannada OCR & parsing...";

            try
            {
                byte[] fileBytes = await File.ReadAllBytesAsync(_selectedPdfPath);
                string base64 = Convert.ToBase64String(fileBytes);

                // Call Gemini REST API
                _processedData = await ProcessWithGeminiAsync(base64);
                DisplayPreview(_processedData);

                StatusText.Text = "Completed! Ready to export annotated PDF.";
                BtnExportPdf.IsEnabled = true;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Processing Failed");
                StatusText.Text = "Failed.";
            }
            finally
            {
                ProgressBar.Visibility = Visibility.Collapsed;
            }
        }

        private void BtnExportPdf_Click(object sender, RoutedEventArgs e)
        {
            if (_processedData == null) return;

            var dlg = new SaveFileDialog
            {
                Filter = "PDF Files (*.pdf)|*.pdf",
                FileName = "Annotated_Kannada_Worksheet.pdf"
            };

            if (dlg.ShowDialog() == true)
            {
                GenerateQuestPdf(dlg.FileName, _processedData);
                MessageBox.Show($"PDF successfully generated at:\\n{dlg.FileName}", "Export Complete");
            }
        }

        private void GenerateQuestPdf(string outputPath, WorksheetData data)
        {
            Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontFamily("Noto Sans Kannada").FontSize(10));

                    page.Header()
                        .Text(data.WorksheetTitle)
                        .SemiBold().FontSize(16).FontColor(Colors.Blue.Medium);

                    page.Content().Column(col =>
                    {
                        foreach (var section in data.Sections)
                        {
                            col.Item().PaddingTop(10).Text(section.SectionTitleKannada)
                               .Bold().FontSize(12).FontColor(Colors.Grey.Darken3);

                            col.Item().Text($"{section.SectionTitlePronunciation} - {section.SectionTitleEnglish}")
                               .Italic().FontColor(Colors.Grey.Medium);

                            foreach (var item in section.Items)
                            {
                                col.Item().PaddingVertical(5).Border(1).BorderColor(Colors.Grey.Lighten2)
                                   .Padding(8).Column(itemCol =>
                                {
                                    itemCol.Item().Text(item.KannadaText).Bold().FontSize(11);
                                    itemCol.Item().Text($"Pronunciation: {item.EnglishPronunciation}").FontColor(Colors.Teal.Darken2);
                                    itemCol.Item().Text($"Translation: {item.EnglishTranslation}").FontColor(Colors.Indigo.Darken2);

                                    // Word Table
                                    itemCol.Item().PaddingTop(4).Table(table =>
                                    {
                                        table.ColumnsDefinition(c =>
                                        {
                                            c.RelativeColumn(1);
                                            c.RelativeColumn(1);
                                            c.RelativeColumn(2);
                                        });

                                        table.Header(h =>
                                        {
                                            h.Cell().Background(Colors.Grey.Lighten3).Padding(3).Text("Kannada").Bold();
                                            h.Cell().Background(Colors.Grey.Lighten3).Padding(3).Text("Pronunciation").Bold();
                                            h.Cell().Background(Colors.Grey.Lighten3).Padding(3).Text("English Meaning").Bold();
                                        });

                                        foreach (var word in item.Words)
                                        {
                                            table.Cell().Padding(3).Text(word.Kannada);
                                            table.Cell().Padding(3).Text(word.Pronunciation);
                                            table.Cell().Padding(3).Text(word.EnglishMeaning);
                                        }
                                    });
                                });
                            }
                        }
                    });
                });
            }).GeneratePdf(outputPath);
        }
    }
}
`;
