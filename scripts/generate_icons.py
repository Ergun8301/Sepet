#!/usr/bin/env python3
"""
Script to generate Android app icons and splash screens for KapKurtar
Brand color: #00A690 (vert KapKurtar)
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Brand colors
BRAND_GREEN = (0, 166, 144)  # #00A690
WHITE = (255, 255, 255)
DARK_GREEN = (0, 130, 113)

# Icon sizes for Android
ICON_SIZES = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192
}

# Foreground icon sizes (slightly larger for adaptive icons)
FOREGROUND_SIZES = {
    'mdpi': 108,
    'hdpi': 162,
    'xhdpi': 216,
    'xxhdpi': 324,
    'xxxhdpi': 432
}

# Splash screen sizes
SPLASH_SIZES = {
    'mdpi': (320, 480),
    'hdpi': (480, 800),
    'xhdpi': (720, 1280),
    'xxhdpi': (960, 1600),
    'xxxhdpi': (1280, 1920)
}

SPLASH_LAND_SIZES = {
    'mdpi': (480, 320),
    'hdpi': (800, 480),
    'xhdpi': (1280, 720),
    'xxhdpi': (1600, 960),
    'xxxhdpi': (1920, 1280)
}

def create_icon(size, is_round=False, is_foreground=False):
    """Create a KapKurtar app icon"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0) if is_foreground else BRAND_GREEN)
    draw = ImageDraw.Draw(img)

    if is_foreground:
        # For foreground, draw on transparent background with safe zone
        safe_zone = size * 0.66  # 66% safe zone
        offset = (size - safe_zone) / 2

        # Draw circle background
        draw.ellipse([offset, offset, offset + safe_zone, offset + safe_zone], fill=BRAND_GREEN)

        # Draw K letter
        k_size = int(safe_zone * 0.5)
        k_x = size / 2
        k_y = size / 2

        # Draw stylized K
        line_width = max(int(k_size * 0.15), 2)

        # Vertical line of K
        draw.line([(k_x - k_size * 0.25, k_y - k_size * 0.4),
                   (k_x - k_size * 0.25, k_y + k_size * 0.4)], fill=WHITE, width=line_width)

        # Diagonal lines of K
        draw.line([(k_x - k_size * 0.25, k_y),
                   (k_x + k_size * 0.25, k_y - k_size * 0.4)], fill=WHITE, width=line_width)
        draw.line([(k_x - k_size * 0.25, k_y),
                   (k_x + k_size * 0.25, k_y + k_size * 0.4)], fill=WHITE, width=line_width)
    else:
        if is_round:
            # Create circular mask
            mask = Image.new('L', (size, size), 0)
            mask_draw = ImageDraw.Draw(mask)
            mask_draw.ellipse([0, 0, size, size], fill=255)

            # Create icon with circle
            circle_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            circle_draw = ImageDraw.Draw(circle_img)
            circle_draw.ellipse([0, 0, size, size], fill=BRAND_GREEN)

            # Draw K on circle
            k_size = int(size * 0.5)
            k_x = size / 2
            k_y = size / 2
            line_width = max(int(k_size * 0.15), 2)

            circle_draw.line([(k_x - k_size * 0.25, k_y - k_size * 0.4),
                       (k_x - k_size * 0.25, k_y + k_size * 0.4)], fill=WHITE, width=line_width)
            circle_draw.line([(k_x - k_size * 0.25, k_y),
                       (k_x + k_size * 0.25, k_y - k_size * 0.4)], fill=WHITE, width=line_width)
            circle_draw.line([(k_x - k_size * 0.25, k_y),
                       (k_x + k_size * 0.25, k_y + k_size * 0.4)], fill=WHITE, width=line_width)

            img = circle_img
        else:
            # Square icon with rounded corners effect via K letter
            k_size = int(size * 0.5)
            k_x = size / 2
            k_y = size / 2
            line_width = max(int(k_size * 0.15), 2)

            draw.line([(k_x - k_size * 0.25, k_y - k_size * 0.4),
                       (k_x - k_size * 0.25, k_y + k_size * 0.4)], fill=WHITE, width=line_width)
            draw.line([(k_x - k_size * 0.25, k_y),
                       (k_x + k_size * 0.25, k_y - k_size * 0.4)], fill=WHITE, width=line_width)
            draw.line([(k_x - k_size * 0.25, k_y),
                       (k_x + k_size * 0.25, k_y + k_size * 0.4)], fill=WHITE, width=line_width)

    return img


def create_splash(width, height, logo_size=None):
    """Create a splash screen with centered logo"""
    img = Image.new('RGB', (width, height), BRAND_GREEN)
    draw = ImageDraw.Draw(img)

    # Calculate logo size (about 30% of the smallest dimension)
    if logo_size is None:
        logo_size = min(width, height) * 0.3

    # Center position
    center_x = width / 2
    center_y = height / 2

    # Draw white circle as logo background
    circle_radius = logo_size / 2
    draw.ellipse([center_x - circle_radius, center_y - circle_radius,
                  center_x + circle_radius, center_y + circle_radius], fill=WHITE)

    # Draw K inside the circle
    k_size = logo_size * 0.5
    line_width = max(int(k_size * 0.12), 3)

    draw.line([(center_x - k_size * 0.25, center_y - k_size * 0.4),
               (center_x - k_size * 0.25, center_y + k_size * 0.4)], fill=BRAND_GREEN, width=line_width)
    draw.line([(center_x - k_size * 0.25, center_y),
               (center_x + k_size * 0.25, center_y - k_size * 0.4)], fill=BRAND_GREEN, width=line_width)
    draw.line([(center_x - k_size * 0.25, center_y),
               (center_x + k_size * 0.25, center_y + k_size * 0.4)], fill=BRAND_GREEN, width=line_width)

    return img


def main():
    # Base path for Android resources
    base_path = '/home/user/Sepet/android/app/src/main/res'

    print("Generating Android app icons...")

    # Generate launcher icons
    for density, size in ICON_SIZES.items():
        folder = f'{base_path}/mipmap-{density}'
        os.makedirs(folder, exist_ok=True)

        # Regular icon
        icon = create_icon(size, is_round=False)
        icon.save(f'{folder}/ic_launcher.png', 'PNG')
        print(f"  Created ic_launcher.png for {density} ({size}x{size})")

        # Round icon
        icon_round = create_icon(size, is_round=True)
        icon_round.save(f'{folder}/ic_launcher_round.png', 'PNG')
        print(f"  Created ic_launcher_round.png for {density} ({size}x{size})")

    # Generate foreground icons for adaptive icons
    for density, size in FOREGROUND_SIZES.items():
        folder = f'{base_path}/mipmap-{density}'
        os.makedirs(folder, exist_ok=True)

        icon_fg = create_icon(size, is_foreground=True)
        icon_fg.save(f'{folder}/ic_launcher_foreground.png', 'PNG')
        print(f"  Created ic_launcher_foreground.png for {density} ({size}x{size})")

    print("\nGenerating splash screens...")

    # Generate portrait splash screens
    for density, (width, height) in SPLASH_SIZES.items():
        folder = f'{base_path}/drawable-port-{density}'
        os.makedirs(folder, exist_ok=True)

        splash = create_splash(width, height)
        splash.save(f'{folder}/splash.png', 'PNG')
        print(f"  Created portrait splash for {density} ({width}x{height})")

    # Generate landscape splash screens
    for density, (width, height) in SPLASH_LAND_SIZES.items():
        folder = f'{base_path}/drawable-land-{density}'
        os.makedirs(folder, exist_ok=True)

        splash = create_splash(width, height)
        splash.save(f'{folder}/splash.png', 'PNG')
        print(f"  Created landscape splash for {density} ({width}x{height})")

    # Generate default splash
    default_folder = f'{base_path}/drawable'
    os.makedirs(default_folder, exist_ok=True)
    splash = create_splash(480, 800)
    splash.save(f'{default_folder}/splash.png', 'PNG')
    print(f"  Created default splash")

    print("\nAll icons and splash screens generated successfully!")


if __name__ == '__main__':
    main()
