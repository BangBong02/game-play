# Offline demo audio only. Uses an installed English US SAPI voice and ffmpeg.
$ErrorActionPreference = 'Stop'
$audioRoot = Join-Path $PSScriptRoot '../public/media/audio/vocabulary'
New-Item -ItemType Directory -Path $audioRoot -Force | Out-Null
$audioRoot = (Resolve-Path -LiteralPath $audioRoot).Path
$demoWords = node --experimental-strip-types --input-type=module -e "import {words} from './src/data/content.ts'; console.log(words.map(w=>w.word).join(','));"
if ($LASTEXITCODE -ne 0) { throw 'Unable to read demo vocabulary.' }
$speech = New-Object -ComObject SAPI.SpVoice
$voice = $speech.GetVoices() | Where-Object { $_.GetDescription() -eq 'Microsoft Zira Desktop - English (United States)' } | Select-Object -First 1
if (!$voice) { throw 'The configured English US demo voice is not installed.' }
$speech.Voice = $voice
$speech.Rate = -1
try {
  foreach ($word in $demoWords.Trim().Split(',')) {
    if ($word -notmatch '^[a-z]+$') { throw 'Unexpected demo filename.' }
    $wavPath = Join-Path $audioRoot "$word-us.wav"
    $mp3Path = Join-Path $audioRoot "$word-us.mp3"
    $stream = New-Object -ComObject SAPI.SpFileStream
    try {
      $stream.Open($wavPath, 3, $false)
      $speech.AudioOutputStream = $stream
      $speech.Speak($word) | Out-Null
    } finally {
      $stream.Close()
      [System.Runtime.InteropServices.Marshal]::ReleaseComObject($stream) | Out-Null
    }
    & ffmpeg -loglevel error -y -i $wavPath -ar 22050 -ac 1 -codec:a libmp3lame -b:a 48k $mp3Path
    if ($LASTEXITCODE -ne 0) { throw "Audio conversion failed: $word" }
    # The resolved directory is the explicit project media directory; remove only this generated WAV.
    Remove-Item -LiteralPath $wavPath
  }
} finally {
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($speech) | Out-Null
}
Write-Output "Created $($demoWords.Trim().Split(',').Count) English US MP3 demo clips."
