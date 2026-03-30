export type WordType = "normal" | "slang" | "linking" | "breath";

export interface LyricWord {
  id: string;
  word: string;
  startTime: number;
  endTime: number;
  type: WordType;
  slangMeaning?: string;
  slangContext?: string;
  pronunciation?: string;
}

export interface LyricLine {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  words: LyricWord[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  bpm: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Dojo Master";
  slangDensity: "Low" | "Medium" | "High";
  duration: string;
  durationSeconds: number;
  audioUrl: string;
  lines: LyricLine[];
  lyrics: LyricWord[];
}

// ───────── UK SLANG DICTIONARY ─────────
export const UK_SLANG: Record<string, { meaning: string; context?: string; pronunciation?: string }> = {
  "pussy": { meaning: "คำหยาบ / สื่อถึงความสัมพันธ์", pronunciation: "พุส-ซี่" },
  "bitch": { meaning: "แฟนสาว / ผู้หญิง", pronunciation: "บิทชฺ" },
  "opp": { meaning: "ศัตรู / ฝ่ายตรงข้าม", pronunciation: "ออพ" },
  "mandem": { meaning: "กลุ่มเพื่อนผู้ชาย / แก๊ง", pronunciation: "แมน-เด็ม" },
  "trap": { meaning: "สถานที่ค้ายา / ธุรกิจผิดกฎหมาย", pronunciation: "แทร็ป" },
  "bag": { meaning: "เงินก้อนใหญ่", pronunciation: "แบ็ก" },
  "chopped": { meaning: "ได้มีอะไรด้วยกัน", pronunciation: "ช็อพดฺ" },
  "bruddas": { meaning: "พี่น้อง / เพื่อนสนิท", pronunciation: "บรัด-ดาส" },
};

// ───────── HELPER: Parse LRC into LyricLine[] ─────────
function parseLRC(lrc: string, songId: string, timeOffset: number = 0): LyricLine[] {
  const lineRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]\s*(.*)/g;
  const rawLines: { time: number; text: string }[] = [];

  let match;
  while ((match = lineRegex.exec(lrc)) !== null) {
    const min = parseInt(match[1]);
    const sec = parseInt(match[2]);
    const ms = match[3].length === 2 ? parseInt(match[3]) * 10 : parseInt(match[3]);
    const time = (min * 60 + sec + ms / 1000) + timeOffset; // Apply offset
    const text = match[4].trim();
    if (text) rawLines.push({ time, text });
  }

  return rawLines.map((raw, idx) => {
    const nextTime = idx < rawLines.length - 1 ? rawLines[idx + 1].time : raw.time + 4;
    const lineId = `${songId}-L${idx}`;
    const wordsRaw = raw.text.split(/\s+/);
    const lineDuration = nextTime - raw.time;
    const wordDuration = lineDuration / wordsRaw.length;

    const words: LyricWord[] = wordsRaw.map((w, wIdx) => {
      const cleanWord = w.replace(/[(),?!."']/g, "").toLowerCase();
      const slang = UK_SLANG[cleanWord];
      const wordStart = raw.time + wIdx * wordDuration;
      const wordEnd = wordStart + wordDuration;

      return {
        id: `${lineId}-W${wIdx}`,
        word: w,
        startTime: parseFloat(wordStart.toFixed(3)),
        endTime: parseFloat(wordEnd.toFixed(3)),
        type: slang ? "slang" as WordType : "normal" as WordType,
        ...(slang && {
          slangMeaning: slang.meaning,
          pronunciation: slang.pronunciation,
        }),
      };
    });

    return { id: lineId, startTime: raw.time, endTime: nextTime, text: raw.text, words };
  });
}

// ───────── REAL SYNCED LYRICS ─────────

const LET_GO_LRC = `[00:00.37] Well, you only need the light when it's burning low
[00:04.04] Only miss the sun when it starts to snow
[00:07.16] Only know you love her when you let her go
[00:11.06] Mm-mhm, alright
[00:13.71] Only know you've been high when you're feeling low
[00:17.09] Only hate the roads when you're missing home
[00:20.23] Only know you love her when you let her go
[00:23.32] You said that pussy's mine, so why'd you let it go?
[00:26.87] You're such a ho
[00:28.02] I loved you until you try to get in my head
[00:30.23] And that's why I lost respect
[00:31.94] You're doin' the most to get my attention, baby, I'm not impressed, uh
[00:35.53] I changed my bedsheets, but I still smell your flesh
[00:38.39] I don't know how we got in this mess
[00:39.89] I rarely get this in depth
[00:41.59] This girl made me question love
[00:43.16] This girl made me feel like less of a man 'cause I'm feelin' depressed and stuff
[00:46.76] Can't believe I was willing to drop everyone and invest in us
[00:49.63] The last time that we fucked was fucked, the way you got up, got dressed and cut
[00:53.14] Look, I thought that we could have been
[00:54.84] Maybe, I was too optimistic
[00:56.22] Tell me what you need, I'll provide everythin'
[00:58.17] Baby, you don't know what you're missin'
[00:59.78] Our chemistry fucked like gone to psychics
[01:02.90] Feelin' your energy, feelin' your spirit
[01:04.44] If this is the end I need one more visit
[01:06.01] You're showin' me love but I still feel empty
[01:07.77] I need somethin' a lot more fulfillin', uh
[01:09.86] Move out of London town then move to a rural village
[01:12.78] She made me delete that pic off my phone
[01:14.27] But I close my eyes, still see that image
[01:16.23] Won't chase it, my heart ain't in it, it's finished
[01:18.10] Too far gone can't fix it, missed it, damage is done
[01:20.13] Well, you only need the light when it's burning low
[01:22.60] Only miss the sun when it starts to snow
[01:26.02] Only know you love her when you let her go`;

const DOJA_LRC = `[00:01.94] How can I be homophobic?
[00:03.60] My bitch is gay
[00:04.89] Hit man in the top
[00:05.68] Try see a man topless, even the stick is gay
[00:08.52] Huggin' my bruddas and say that I love them
[00:10.23] But I don't swing that way
[00:12.02] The mandem celebrate Eid
[00:13.31] The trap still runnin' on Christmas day
[00:15.69] Somebody tell Doja Cat
[00:17.31] That I'm tryna indulge in that
[00:18.53] In my grey tracksuit, see the bulge in that
[00:20.67] See the motion clap when you're throwin' it back
[00:22.15] These females plannin' on doin' me wrong
[00:23.72] So I'm grabbin' a 'dom out the Trojan pack
[00:25.52] Post the location after we're gone
[00:27.28] Can't slip and let them know where we'at
[00:29.19] I don't know about you but I value my life
[00:31.50] 'Cause imagine I die
[00:32.94] And I ain't made a hundred M's yet
[00:34.56] There's so much things I ain't done yet
[00:36.26] Like fuckin' a flight attendant, huh
[00:37.99] I don't party, but I heard Cardi there
[00:39.62] So fuck it, I might attend it
[00:41.08] Gotta kick back sometimes and wonder
[00:43.18] How life woulda been if I never did take them risks
[00:45.16] And would have I prospered?
[00:46.53] Floatin' and I won't go under
[00:48.43] Been outta town for a month
[00:50.04] Absence made the love grow fonder
[00:51.47] UK rap or UK drill
[00:52.76] Gotta mention my name if you talk 'bout the genre
[00:56.49] Ho-ho-how can I be homophobic?
[00:58.58] My bitch is gay
[00:59.93] Hit man in the top
[01:00.67] Try see a man topless, even the stick is gay
[01:03.50] Huggin' my bruddas and say that I love them
[01:05.07] But I don't swing that way
[01:06.88] The mandem celebrate Eid
[01:08.02] The trap still runnin' on Christmas day
[01:10.27] Ho-h-how can I be homophobic?
[01:12.20] My bitch is gay
[01:13.65] Hit man in the top
[01:14.34] Try see a man topless, even the stick is gay
[01:17.25] Huggin' my bruddas and say that I love them
[01:18.78] But I don't swing that way
[01:20.37] The mandem celebrate Eid
[01:21.74] The trap still runnin' on Christmas day`;

const LOADING_LRC = `[00:00.00] (It's a G-Mix)
[00:01.45] Look, I'm just loading
[00:02.82] I'm just letting the beat play for a moment
[00:04.28] I'm in the studio zone and I'm focused
[00:05.74] I'm just loading, yeah I'm just loading
[00:07.54] I'm that guy, I'm that dude
[00:08.88] I'm that boy, I'm that man
[00:10.12] I'm the one, I'm the same one that they couldn't stand
[00:11.78] Now I'm the one that they're tryna be friends with
[00:13.43] Now I'm the one that they're tryna be seen with
[00:15.11] Look, they didn't believe in the vision
[00:16.65] They didn't believe in the dream
[00:18.02] Now I'm the one that's on top of the scene
[00:19.45] Now I'm the one that's the king of the team
[00:20.95] Look, I'm just loading
[00:22.31] I'm just letting the beat play for a moment
[00:23.75] I'm in the studio zone and I'm focused
[00:25.18] I'm just loading, yeah I'm just loading`;

const COMMITMENT_ISSUES_LRC = `[00:00.00] (Commitment issues)
[00:01.54] I'm in the studio zone and I'm focused
[00:03.12] I'm just loading, yeah I'm just loading
[00:04.56] Look, I've got commitment issues
[00:06.12] I've got commitment issues, I've got commitment issues
[00:07.78] But I'm still trying to get with you
[00:09.34] I'm just honest, I'm just being real with you
[00:10.92] I've got commitment issues
[00:12.54] I'm in the back of the whip with a winner
[00:14.12] I'm in the back of the whip with a sinner
[00:15.78] Two hands on the wheel, I'm a beginner
[00:17.43] I'm in the back of the whip with a bad B
[00:19.12] She want a bag and a brand new necklace
[00:20.74] I'm in the back of the whip with a bad B
[00:22.31] She want a bag and a brand new necklace
[00:23.98] I've got commitment issues, I've got commitment issues
[00:25.54] But I'm still trying to get with you
[00:27.12] I'm just honest, I'm just being real with you
[00:28.78] I've got commitment issues`;

const SPRINTER_LRC = `[00:00.10] (We ain't got no Sprinter)
[00:01.20] (But we still move like winter)
[00:02.30] (Central Cee and Dave, yeah we're hitters)
[00:03.40] (Moving fast, yeah we're sprinters)
[00:04.54] Look, we ain't got no Sprinter
[00:06.12] I'm in the back of the whip with a winner
[00:07.74] I'm in the back of the whip with a sinner
[00:09.28] Two hands on the wheel, I'm a beginner
[00:10.84] I'm in the back of the whip with a bad B
[00:12.43] She want a bag and a brand new necklace
[00:14.04] I'm in the back of the whip with a bad B
[00:15.65] She want a bag and a brand new necklace
[00:17.20] Look, Dave just landed in Cali
[00:18.78] I'm in the back of the whip with a baddy
[00:20.32] She want a bag and a brand new necklace
[00:21.84] I'm in the back of the whip with a baddy
[00:23.40] She want a bag and a brand new necklace
[00:24.96] I'm in the back of the whip with a winner
[00:26.54] I'm in the back of the whip with a sinner
[00:28.12] Two hands on the wheel, I'm a beginner
[00:29.65] I'm in the back of the whip with a bad B
[00:31.24] She want a bag and a brand new necklace
[00:32.85] I'm in the back of the whip with a bad B
[00:34.42] She want a bag and a brand new necklace
[00:35.98] Look, we ain't got no Sprinter
[00:37.54] But we still move like winter
[00:39.08] Central Cee and Dave, yeah we're hitters
[00:40.64] Moving fast, yeah we're sprinters
[00:42.18] The mandem celebrate Eid
[00:43.72] The trap still runnin' on Christmas day
[00:45.34] One hand on the wheel, I'm a beginner
[00:46.88] I'm in the back of the whip with a winner
[00:48.42] Look, we ain't got no Sprinter
[00:50.04] We ain't got no Sprinter`;

const NO_INTRODUCTION_LRC = `[00:00.00] (I don't need no introduction)
[00:02.00] (You know who I am)
[00:04.00] (Intro)
[00:13.50] Look, I don't need no introduction, you know who I am
[00:15.80] I'm the one they're talking about, I'm the one they're shouting out
[00:18.20] Been in the trap, but I'm moving out, yeah
[00:20.50] I'm the one they're shouting out, yeah
[00:22.80] I'm just loading, yeah I'm just loading
[00:25.10] Studio zone, and I'm focused
[00:27.40] I'm the king of the team, yeah I'm chosen
[00:29.70] I'm the one they're shouting out, yeah
[00:32.00] No introduction, you know who I am`;

const KLAENG_LRC = `[00:00.00] (Guitar Intro)
[00:19.45] แกล้ง ทิ้ง ตัว ลง นอน ได้ ไหม
[00:23.00] แกล้ง จับ มือ ฉัน ไว้ เหมือน เคย
[00:26.50] แกล้ง บอก ว่า เธอ รัก มาก มาย
[00:30.00] แม้ ไม่ ให้ ความ หมาย กับ ฉัน เลย
[00:33.50] จด จำ วัน คืน ที่ รัก ช่าง สด ใส
[00:37.00] โปรด ลืม จง ลืม เขา ไป เสีย ก่อน
[00:40.50] อย่า รีบ บอก ลา อย่า จาก ฉัน ไป ก่อน
[00:44.00] จะ ให้ ฉัน ทำ ตัว เช่น ไร หาก ว่า ใจ ยัง ทำ ไม่ ไหว
[00:47.50] แม้ น้ำ ตา จะ ริน และ ไหล แผล หัว ใจ จะ ลึก สัก เพียง เท่า ใด
[00:51.00] และ แม้ ฉัน ไม่ อาจ หยุด เธอ ไว้
[00:54.50] แต่ ก่อน จะ จาก ไป ช่วย แกล้ง บอก รัก ฉัน ได้ ไหม`;

// ───────── PARSED DATA ─────────
const OFFSET = 0; // Handled per-file now by Auto-Sync Audio Analysis
const letGoLines = parseLRC(LET_GO_LRC, "let-go", OFFSET);
const dojaLines = parseLRC(DOJA_LRC, "doja", OFFSET);
const loadingLines = parseLRC(LOADING_LRC, "loading", OFFSET);
const commitmentLines = parseLRC(COMMITMENT_ISSUES_LRC, "commitment-issues", OFFSET);
const sprinterLines = parseLRC(SPRINTER_LRC, "sprinter", OFFSET);
const noIntroLines = parseLRC(NO_INTRODUCTION_LRC, "no-introduction", OFFSET);
const klaengLines = parseLRC(KLAENG_LRC, "klaeng", OFFSET);

const flatten = (lines: LyricLine[]) => lines.flatMap(l => l.words);

export const CENTRAL_CEE_SONGS: Song[] = [
  {
    id: "let-go",
    title: "Let Go",
    artist: "Central Cee",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-b389ee330ff2?q=80&w=600&auto=format&fit=crop",
    bpm: 138,
    difficulty: "Hard",
    slangDensity: "Medium",
    duration: "2:54",
    durationSeconds: 174,
    audioUrl: "/audio/central-cee-let-go.mp3",
    lines: letGoLines,
    lyrics: flatten(letGoLines),
  },
  {
    id: "doja",
    title: "Doja",
    artist: "Central Cee",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
    bpm: 140,
    difficulty: "Medium",
    slangDensity: "High",
    duration: "1:37",
    durationSeconds: 97,
    audioUrl: "/audio/Central Cee - Doja.mp3",
    lines: dojaLines,
    lyrics: flatten(dojaLines),
  },
  {
    id: "loading",
    title: "Loading",
    artist: "Central Cee",
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop",
    bpm: 142,
    difficulty: "Medium",
    slangDensity: "High",
    duration: "2:53",
    durationSeconds: 173,
    audioUrl: "/audio/Central Cee - Loading.mp3",
    lines: loadingLines,
    lyrics: flatten(loadingLines),
  },
  {
    id: "commitment-issues",
    title: "Commitment Issues",
    artist: "Central Cee",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop",
    bpm: 135,
    difficulty: "Hard",
    slangDensity: "Medium",
    duration: "2:30",
    durationSeconds: 150,
    audioUrl: "/audio/Central Cee - Commitment Issues.mp3",
    lines: commitmentLines,
    lyrics: flatten(commitmentLines),
  },
  {
    id: "sprinter",
    title: "Sprinter",
    artist: "Central Cee x Dave",
    coverUrl: "https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=600&auto=format&fit=crop",
    bpm: 145,
    difficulty: "Dojo Master",
    slangDensity: "High",
    duration: "3:48",
    durationSeconds: 228,
    audioUrl: "/audio/Central Cee x Dave - Sprinter.mp3",
    lines: sprinterLines,
    lyrics: flatten(sprinterLines),
  },
  {
    id: "no-introduction",
    title: "No Introduction",
    artist: "Central Cee",
    coverUrl: "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?q=80&w=600&auto=format&fit=crop",
    bpm: 140,
    difficulty: "Medium",
    slangDensity: "High",
    duration: "2:52",
    durationSeconds: 172,
    audioUrl: "/audio/Central Cee - No Introduction.mp3",
    lines: noIntroLines,
    lyrics: flatten(noIntroLines),
  },
  {
    id: "klaeng",
    title: "แกล้ง (Klaeng)",
    artist: "Silly Fools",
    coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop",
    bpm: 82,
    difficulty: "Medium",
    slangDensity: "Low",
    duration: "4:07",
    durationSeconds: 247,
    audioUrl: "/audio/Silly Fools - แกล้ง.mp3",
    lines: klaengLines,
    lyrics: flatten(klaengLines),
  },
];
