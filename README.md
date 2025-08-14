# FDA RRM-FT Assistant (FSMA 204)

A comprehensive web-based tool for FDA Risk Ranking Model for Food Tracing (RRM-FT) compliance with FSMA 204 Rule. This application provides a bilingual interface for food safety risk assessment using official FDA data.

## 🎯 Purpose

This tool helps food industry professionals:
- **Assess food safety risks** using official FDA RRM-FT methodology
- **Comply with FSMA 204** Food Traceability Rule requirements
- **Manage analysis projects** with .RRM file format
- **Generate audit-ready reports** in English and French

## 🚀 Features

### Core Functionality
- **FDA Data Integration**: Uses official FDA RRM-FT data with SHA-256 integrity verification
- **Bilingual Interface**: Full French/English support with dynamic switching
- **Risk Assessment**: Displays hazard pairs with C1-C7 criteria scores
- **Project Management**: Save/load analysis projects in .RRM format (ZIP)
- **File Attachments**: Support for any file type as supporting documentation
- **Activity Logging**: Complete audit trail of all actions

### Technical Features
- **Offline Capability**: No backend required, runs entirely in browser
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- **Performance**: Optimized loading with debounced search and caching
- **Security**: Client-side processing with no data sent to external servers

## 📁 Project Structure

```
├── index.html              # Main application interface
├── css/
│   └── styles.css          # Responsive styling with accessibility
├── js/
│   └── app.js             # Modular JavaScript application
├── i18n/
│   ├── en.json            # English translations
│   └── fr.json            # French translations
├── pairs_table_2B/        # FDA hazard pairs data
├── manifest.json          # Data source manifest
├── checksums.json         # SHA-256 integrity verification
└── README.md             # This documentation
```

## 🛠️ Setup Instructions

### Option 1: Direct Usage
1. Download all files to a local directory
2. Open `index.html` in any modern web browser
3. No installation or server required

### Option 2: Local Development
1. Clone or download the project
2. Ensure all data files are present in correct directories
3. Open `index.html` or serve via any HTTP server

### Required Data Files
The application expects these FDA data files:
- `pairs_table_2B/commodities.json`
- `pairs_table_2B/hazard_pairs.json`
- `commodities_table_2A.json`
- `manifest.json`
- `checksums.json`

## 📊 Usage Guide

### Basic Workflow
1. **Load Data**: Application automatically verifies FDA data integrity
2. **Select Commodity**: Search or browse available food products
3. **Review Hazards**: View risk scores for all associated hazard pairs
4. **Create Project**: Save analysis with notes and attachments
5. **Export Results**: Generate audit-ready reports

### Keyboard Shortcuts
- `Ctrl+S`: Save current project
- `Ctrl+E`: Export results in English
- `Tab`: Navigate between elements
- `Enter`: Activate buttons and selections

### Project Files (.RRM)
- **Format**: ZIP archive with JSON metadata
- **Contents**: Project data, notes, attachments
- **Compatibility**: Cross-platform, no special software required

## 🔍 Data Sources

### FDA RRM-FT Data
- **Source**: Official FDA Risk Ranking Model for Food Tracing
- **Verification**: SHA-256 checksums for integrity
- **Updates**: Manual refresh when FDA releases new data
- **Accuracy**: No recalculation - uses official FDA scores

### Data Structure
- **Commodities**: Food products with risk scores
- **Hazard Pairs**: Product-hazard combinations with C1-C7 criteria
- **Risk Scores**: Calculated using FDA methodology

## 🧪 Technical Specifications

### Browser Support
- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

### Performance
- **Initial Load**: ~2-3 seconds with full data
- **Search**: Instant with debounced input
- **Memory**: ~50MB peak usage
- **Storage**: Local project files only

### Security
- **No External Calls**: All processing client-side
- **No Data Transmission**: User data stays local
- **File Validation**: SHA-256 integrity checks
- **Safe File Handling**: ZIP extraction with validation

## 🐛 Troubleshooting

### Common Issues

**Data Loading Fails**
- Check console for specific error messages
- Verify all data files are present
- Ensure files have correct SHA-256 checksums

**Search Not Working**
- Try refreshing the page
- Check browser console for JavaScript errors
- Ensure data files loaded successfully

**Project Save Issues**
- Check browser download permissions
- Ensure sufficient disk space
- Try different browser if issues persist

### Debug Mode
Enable debug logging by adding `?debug=1` to URL for detailed console output.

## 📈 Development

### Architecture
- **Modular Design**: Separate concerns for maintainability
- **Progressive Enhancement**: Works without JavaScript (basic)
- **Responsive**: Mobile-first CSS with CSS Grid/Flexbox
- **Accessible**: ARIA labels, keyboard navigation, screen reader support

### Extending
- **New Languages**: Add translation files to `i18n/` directory
- **Custom Data**: Replace FDA data files with validated alternatives
- **New Features**: Extend `js/app.js` with modular additions

## 📄 License

This tool is provided as-is for FDA RRM-FT compliance purposes. FDA data remains property of U.S. Food and Drug Administration.

## 🤝 Support

For issues or questions:
1. Check troubleshooting section above
2. Review browser console for error messages
3. Ensure all required files are present
4. Test in supported browser versions

## 🔄 Updates

To update FDA data:
1. Download latest FDA RRM-FT files
2. Generate new SHA-256 checksums
3. Replace data files in appropriate directories
4. Update manifest.json with new file information

---

**Note**: This tool uses official FDA data and methodology. Risk scores are not recalculated - they reflect FDA's official assessments as of the data file date.