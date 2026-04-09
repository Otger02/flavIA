"""
Extract YouTube transcripts for Flavia's library videos.
Uses youtube-transcript-api to get auto-generated Spanish captions.
"""
import json
import os
import sys

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter


VIDEOS = [
    {"id": "JyTcTemIgdA", "title": "La intimidad esta en el sofa, no en la cama"},
    {"id": "I8RKOiUYEFg", "title": "Conecta con tu deseo"},
    {"id": "EOLu1UZaZwQ", "title": "Que hacer si se pierde la ereccion"},
    {"id": "_AKgRwN6X0o", "title": "Tipos de mujeres en la cama"},
    {"id": "CfxHy-WEp7I", "title": "Cuidando tu zona intima"},
    {"id": "cSIZlnzkJns", "title": "La sexualidad en el mundo contemporaneo"},
    {"id": "xAFFPZx9NOA", "title": "La sexualidad COMO ES"},
    {"id": "C8cngoUcvGU", "title": "Sexualidad en la menopausia"},
    {"id": "8dXhSSpOoZk", "title": "Sexualidad en la mujer mayor"},
    {"id": "QRM-AC1lwKs", "title": "Flavia en Dermatologia Sin Censura"},
]

OUT_DIR = os.path.join(os.path.dirname(__file__), "flavia-knowledge")
os.makedirs(OUT_DIR, exist_ok=True)

formatter = TextFormatter()
results = []

for video in VIDEOS:
    vid = video["id"]
    title = video["title"]
    slug = title.lower().replace(" ", "-").replace("?", "").replace(",", "")[:60]
    outpath = os.path.join(OUT_DIR, f"{slug}.txt")

    print(f"[{vid}] {title}...", end=" ", flush=True)

    try:
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(vid, languages=["es", "es-419", "es-MX", "es-US", "pt", "pt-BR"])

        # Format as plain text
        text = formatter.format_transcript(transcript)

        with open(outpath, "w", encoding="utf-8") as f:
            f.write(f"# {title}\n")
            f.write(f"# YouTube: https://www.youtube.com/watch?v={vid}\n\n")
            f.write(text)

        word_count = len(text.split())
        print(f"OK ({word_count} words)")
        results.append({"id": vid, "title": title, "words": word_count, "file": outpath, "status": "ok"})

    except Exception as e:
        print(f"FAILED: {e}")
        results.append({"id": vid, "title": title, "status": "failed", "error": str(e)})

print("\n=== Summary ===")
ok = [r for r in results if r["status"] == "ok"]
failed = [r for r in results if r["status"] == "failed"]
total_words = sum(r.get("words", 0) for r in ok)
print(f"Extracted: {len(ok)}/{len(VIDEOS)} videos")
print(f"Total words: {total_words:,}")
if failed:
    print(f"Failed: {', '.join(r['title'] for r in failed)}")
