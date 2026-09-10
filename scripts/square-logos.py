from PIL import Image
import os

LOGOS_DIR = "/Users/luyijiangjiangluyi/WorkBuddy/2026-08-11-task-105/public/logos"


def make_square(path):
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    size = max(w, h)

    # 背景色取四角均值
    pixels = img.load()
    corners = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    bg = [0, 0, 0]
    for x, y in corners:
        for i in range(3):
            bg[i] += pixels[x, y][i]
    bg = tuple(c // len(corners) for c in bg)

    canvas = Image.new("RGBA", (size, size), bg + (255,))
    offset = ((size - w) // 2, (size - h) // 2)
    canvas.paste(img, offset, img)
    canvas.save(path)
    print(f"squared {os.path.basename(path)}: {w}x{h} -> {size}x{size}")


for filename in os.listdir(LOGOS_DIR):
    if filename.lower().endswith(".png"):
        make_square(os.path.join(LOGOS_DIR, filename))
