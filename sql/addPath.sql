NSERT INTO
  ConfigSettings (
    Name,
    Description,
    Visible,
    AllowMultiple,
    DataType,
    Parent,
    Label,
    OrderNumber
  )
VALUE(
  'labelPrintingPath',
  'Path to print barcode.zpl',
  1,
  0,
  'text',
  26,
  'Path to label text file',
  10);
