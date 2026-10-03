// Project-authored vectors rasterized with Astro's existing sharp dependency.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const drawings = {
  book: '<path d="M120 49Q84 26 36 43v91q48-12 84 8 36-20 84-8V43q-48-17-84 6Z" fill="#fffdf5"/><path d="M120 49v93M49 59l53 9M49 78l53 9M49 97l53 9M139 68l50-9M139 87l50-9M139 106l50-9" fill="none"/><path d="M35 135q49-11 85 8 36-19 85-8" fill="none" stroke="#267b69"/>',
  pen: '<g transform="rotate(-40 120 90)"><path d="M101 31h38v106l-19 26-19-26Z" fill="#6faed1"/><path d="M103 120h34M113 152h14M108 31V19h24v12" fill="#fff"/><path d="M139 43h10v50" fill="none"/></g>',
  bag: '<path d="M98 42V29q22-18 44 0v13" fill="none"/><rect x="61" y="42" width="118" height="115" rx="30" fill="#82b8cd"/><rect x="81" y="97" width="78" height="43" rx="10" fill="#f9faf6"/><path d="M87 66h66M89 111h62"/>',
  bed: '<path d="M32 44v107M207 88v63M32 132h175" fill="none"/><path d="M36 81h168v48H36Z" fill="#a6cfb3"/><rect x="40" y="61" width="56" height="29" rx="9" fill="#fff"/><path d="M103 83v43" fill="none"/>',
  chair: '<rect x="72" y="30" width="96" height="66" rx="8" fill="#d7a376"/><path d="M73 94v56M167 94v56M92 111v45M147 111v45" fill="none"/><path d="M64 93h112l-16 23H80Z" fill="#ebc199"/>',
  table: '<path d="M35 69h170l-18 30H53Z" fill="#e9bd94"/><path d="M55 99v54M187 99v54M74 99v43M168 99v43" fill="none"/><path d="M37 70v22h15M203 70v22h-15" fill="none"/>',
  door: '<rect x="72" y="22" width="99" height="139" rx="3" fill="#e1b890"/><rect x="89" y="39" width="63" height="48" rx="3" fill="#f1d7ba"/><rect x="89" y="111" width="63" height="32" rx="3" fill="#f1d7ba"/><circle cx="151" cy="100" r="5" fill="#b9884b"/>',
  house: '<path d="M56 77h128v79H56Z" fill="#ffe8bd"/><path d="m38 79 82-57 82 57Z" fill="#bd776b"/><rect x="103" y="104" width="36" height="52" rx="2" fill="#a6ccbb"/><rect x="67" y="93" width="24" height="25" fill="#fff"/><rect x="151" y="93" width="24" height="25" fill="#fff"/>',
  car: '<path d="m28 100 32-12 27-37h60l32 37 29 12v32H28Z" fill="#86b5cf"/><path d="M93 60h21v31H71ZM124 60h17l27 31h-44Z" fill="#f9fcff"/><circle cx="67" cy="134" r="18" fill="#526875"/><circle cx="177" cy="134" r="18" fill="#526875"/><circle cx="67" cy="134" r="7" fill="#fff"/><circle cx="177" cy="134" r="7" fill="#fff"/>',
  bus: '<rect x="26" y="51" width="188" height="83" rx="13" fill="#edc971"/><path d="M40 65h24v31H40ZM77 65h24v31H77ZM114 65h24v31h-24ZM151 65h24v31h-24ZM185 65h15v52h-15Z" fill="#eef8ff"/><circle cx="64" cy="136" r="17" fill="#526875"/><circle cx="177" cy="136" r="17" fill="#526875"/><circle cx="64" cy="136" r="6" fill="#fff"/><circle cx="177" cy="136" r="6" fill="#fff"/>',
};
await mkdir('public/media/images/vocabulary', { recursive: true });
for (const [word, drawing] of Object.entries(drawings)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 240 180"><rect width="240" height="180" rx="20" fill="#f5f7f2"/><g stroke="#4f655b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">${drawing}</g></svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 85 }).toFile(`public/media/images/vocabulary/${word}.webp`);
}
console.log(`Created ${Object.keys(drawings).length} owned WebP illustrations.`);
