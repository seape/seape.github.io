#!/usr/bin/env python3
"""
Script to translate markdown files from Chinese to English
Usage: python translate_docs.py
"""

import os
import re
from pathlib import Path
from anthropic import Anthropic

# Initialize Anthropic client
client = Anthropic()

# Source and target directories
SOURCE_BASE = Path("/home/haiyue/personal/blog/astro.blog/modules/jet-w_blog2/content/posts/blog_docs_zh/techniques/LLM-MCP")
TARGET_BASE = Path("/home/haiyue/personal/blog/astro.blog/modules/jet-w_blog2/content/posts/blog_docs_en/techniques/LLM-MCP")

def translate_content(chinese_content: str) -> str:
    """
    Translate Chinese markdown content to English using Claude
    """
    system_prompt = """You are a professional technical translator. Translate the following Chinese markdown document to English while:
1. Preserving ALL markdown formatting (headers, lists, code blocks, tables, etc.)
2. Keeping ALL code blocks unchanged (including code, commands, and syntax)
3. Translating YAML frontmatter titles and descriptions
4. Maintaining all links and image references
5. Using natural, fluent technical English
6. Keeping technical terms accurate and consistent

Translate the content directly without any preamble or explanation."""

    try:
        message = client.messages.create(
            model="claude-opus-4-5-20251101",
            max_tokens=16000,
            temperature=0,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": f"Translate this technical document from Chinese to English:\n\n{chinese_content}"
                }
            ]
        )

        return message.content[0].text
    except Exception as e:
        print(f"Translation error: {e}")
        return None

def translate_file(source_path: Path, target_path: Path):
    """
    Translate a single markdown file
    """
    print(f"Translating: {source_path.name}")

    # Read source file
    with open(source_path, 'r', encoding='utf-8') as f:
        chinese_content = f.read()

    # Translate
    english_content = translate_content(chinese_content)

    if english_content:
        # Create target directory if needed
        target_path.parent.mkdir(parents=True, exist_ok=True)

        # Write translated content
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(english_content)

        print(f"  ✓ Saved to: {target_path}")
        return True
    else:
        print(f"  ✗ Translation failed")
        return False

def translate_directory(source_dir: Path, target_dir: Path):
    """
    Translate all markdown files in a directory
    """
    # Find all markdown files
    md_files = list(source_dir.glob("**/*.md"))

    print(f"\nFound {len(md_files)} markdown files in {source_dir}")
    print("=" * 60)

    success_count = 0
    failed_count = 0

    for md_file in sorted(md_files):
        # Calculate relative path
        rel_path = md_file.relative_to(source_dir)
        target_file = target_dir / rel_path

        # Skip if already translated
        if target_file.exists():
            print(f"Skipping (already exists): {md_file.name}")
            continue

        # Translate file
        if translate_file(md_file, target_file):
            success_count += 1
        else:
            failed_count += 1

    print("\n" + "=" * 60)
    print(f"Translation complete!")
    print(f"  Success: {success_count}")
    print(f"  Failed: {failed_count}")
    print(f"  Skipped: {len(md_files) - success_count - failed_count}")

def main():
    """
    Main function to translate all directories
    """
    print("Starting translation process...")
    print(f"Source: {SOURCE_BASE}")
    print(f"Target: {TARGET_BASE}")

    # Check API key
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY environment variable not set")
        print("Please set it with: export ANTHROPIC_API_KEY=your_api_key")
        return

    # Translate each subdirectory
    subdirs = ["DSPy", "MCP-Python", "MCP-Server"]

    for subdir in subdirs:
        source_subdir = SOURCE_BASE / subdir
        target_subdir = TARGET_BASE / subdir

        if source_subdir.exists():
            translate_directory(source_subdir, target_subdir)
        else:
            print(f"Warning: {source_subdir} does not exist")

    # Translate root README
    root_readme_source = SOURCE_BASE / "README.md"
    root_readme_target = TARGET_BASE / "README.md"

    if root_readme_source.exists() and not root_readme_target.exists():
        print("\nTranslating root README.md...")
        translate_file(root_readme_source, root_readme_target)

    print("\n✓ All translations complete!")

if __name__ == "__main__":
    main()
