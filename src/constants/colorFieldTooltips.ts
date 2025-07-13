export const COLOR_FIELD_TOOLTIPS: { [key: string]: string } = {
  'Background Paper': 'Used for cards, dialogs, paper components, and elevated surfaces throughout the app',
  'Text Primary': 'Main text color for headings, body text, and primary content across all pages',
  'Background Default': 'Main page background color for the entire application',
  'Text Secondary': 'Secondary text color for captions, descriptions, and less important content',
  'Text Disabled': 'Text color for disabled buttons, inputs, and inactive UI elements',
  'Primary': 'Main brand color for buttons, links, and primary UI elements',
  'Primary Light': 'Lighter variant of primary color for hover states and subtle highlights',
  'Primary Text': 'Text color for primary buttons and elements with primary background',
  'Primary Hover': 'Background color for primary button hover states',
  'Secondary': 'Secondary brand color for alternative actions and UI elements',
  'Secondary Text': 'Text color for secondary buttons and elements with secondary background',
  'Secondary Hover': 'Background color for secondary button hover states',
  'Divider': 'Color for borders, dividers, and separation lines',
  'Border': 'Color for input borders, card borders, and UI boundaries',
  'Border Hover': 'Color for border hover states on cards, buttons, and interactive elements',
  'Background Hover': 'Background color for hover states on buttons, cards, and interactive elements',
  'Background Surface': 'Color for surface elements like toolbars, headers, and navigation areas',
  'Input Text Color': 'Text color for input fields and form controls',
  'Input Border Color': 'Border color for input fields and form controls',
  'Dropdown Background': 'Background color for dropdown menus and select components',
  'Dropdown Option Background': 'Background color for individual dropdown options',
  'Dropdown Option Text': 'Text color for dropdown options and menu items',
  'Card Background': 'Background color for card components and content containers',
  'Table Header Background': 'Background color for table headers across all data tables in the application',
  'Table Header Text': 'Text color for table headers across all data tables in the application',
  'Table Row Hover Background': 'Background color for table rows when hovered over',
  'Table Border Color': 'Color for table borders and cell separators',
};

export const getColorFieldTooltip = (label: string): string => {
  return COLOR_FIELD_TOOLTIPS[label] || '';
}; 