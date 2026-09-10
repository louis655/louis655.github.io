from PIL import Image
import os
import sys

LOGOS_DIR = "/Users/luyijiangjiangluyi/WorkBuddy/2026-08-11-task-105/public/logos"
PADDING_RATIO = 0.04  # 4% padding around content
THRESHOLD = 32  # color distance threshold


def color_distance(c1, c2):
    return sum((a - b) ** 2 for a, b in zip(c1, c2)) ** 0.5


def trim_image(path):
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    pixels = img.load()

    # 取四角颜色均值作为背景参考
    corners = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    bg = [0, 0, 0, 0]
    for x, y in corners:
        for i in range(4):
            bg[i] += pixels[x, y][i]
    bg = tuple(c // len(corners) for c in bg)

    # 创建临时 alpha：背景色像素透明，内容像素不透明
    alpha_img = Image.new("L", (w, h), 0)
    alpha_pixels = alpha_img.load()
    for y in range(h):
        for x in range(w):
            if color_distance(pixels[x, y][:3], bg[:3]) > THRESHOLD:
                alpha_pixels[x, y] = 255

    bbox = alpha_img.getbbox()
    if not bbox:
        print(f"no content found: {path}")
        return

    x1, y1, x2, y2 = bbox
    # 添加 padding
    pad_x = max(1, int((x2 - x1) * PADDING_RATIO))
    pad_y = max(1, int((y2 - y1) * PADDING_RATIO))
    x1 = max(0, x1 - pad_x)
    y1 = max(0, y1 - pad_y)
    x2 = min(w, x2 + pad_x)
    y2 = min(h, y2 + pad_y)

    cropped = img.crop((x1, y1, x2, y2))
    cropped.save(path)
    print(f"trimmed {os.path.basename(path)}: {w}x{h} -> {cropped.size[0]}x{cropped.size[1]}")


for filename in os.listdir(LOGOS_DIR):
    if filename.lower().endswith(".png"):
        trim_image(os.path.join(LOGOS_DIR, filename))
