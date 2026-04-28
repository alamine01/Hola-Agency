$inputFile = "c:\Users\bahmo\Desktop\Airbnb projetc\Template next js\nextjs\public\logo.svgz"
$outputFile = "c:\Users\bahmo\Desktop\Airbnb projetc\Template next js\nextjs\public\logo.svg"
$input = New-Object System.IO.FileStream $inputFile, ([IO.FileMode]::Open), ([IO.FileAccess]::Read), ([IO.FileShare]::Read)
$output = New-Object System.IO.FileStream $outputFile, ([IO.FileMode]::Create), ([IO.FileAccess]::Write), ([IO.FileShare]::None)
$gzipStream = New-Object System.IO.Compression.GZipStream $input, ([IO.Compression.CompressionMode]::Decompress)
$buffer = New-Object byte[](4096)
while (($read = $gzipStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
    $output.Write($buffer, 0, $read)
}
$gzipStream.Close()
$output.Close()
$input.Close()
