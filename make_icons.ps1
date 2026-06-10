Add-Type -AssemblyName System.Drawing

# 512x512 Icon
$b1 = New-Object System.Drawing.Bitmap(512, 512)
$g1 = [System.Drawing.Graphics]::FromImage($b1)
$g1.Clear([System.Drawing.Color]::FromArgb(255, 30, 39, 46))
$f1 = New-Object System.Drawing.Font('Arial', 80, [System.Drawing.FontStyle]::Bold)
$br = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$g1.DrawString('CUBIX', $f1, $br, 256, 256, $sf)
$b1.Save('icon-512.png', [System.Drawing.Imaging.ImageFormat]::Png)

# 192x192 Icon
$b2 = New-Object System.Drawing.Bitmap(192, 192)
$g2 = [System.Drawing.Graphics]::FromImage($b2)
$g2.Clear([System.Drawing.Color]::FromArgb(255, 30, 39, 46))
$f2 = New-Object System.Drawing.Font('Arial', 35, [System.Drawing.FontStyle]::Bold)
$g2.DrawString('CUBIX', $f2, $br, 96, 96, $sf)
$b2.Save('icon-192.png', [System.Drawing.Imaging.ImageFormat]::Png)

# 1280x720 Screenshot
$b3 = New-Object System.Drawing.Bitmap(1280, 720)
$g3 = [System.Drawing.Graphics]::FromImage($b3)
$g3.Clear([System.Drawing.Color]::FromArgb(255, 30, 39, 46))
$f3 = New-Object System.Drawing.Font('Arial', 150, [System.Drawing.FontStyle]::Bold)
$g3.DrawString('CUBIX 3D', $f3, $br, 640, 360, $sf)
$b3.Save('screenshot.png', [System.Drawing.Imaging.ImageFormat]::Png)
