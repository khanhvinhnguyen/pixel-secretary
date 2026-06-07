import type { HTMLAttributes } from "react";
import {
  DEFAULT_CHARACTER_ID,
  getCharacterAsset,
  type BuddyCharacterId,
} from "./characterAssets";

export interface PixelAssistantProps extends HTMLAttributes<HTMLDivElement> {
  characterId?: BuddyCharacterId;
  scale?: number;
}

export function PixelAssistant({
  characterId = DEFAULT_CHARACTER_ID,
  scale = 1,
  className = "",
  style,
  ...props
}: PixelAssistantProps) {
  const asset = getCharacterAsset(characterId);
  const size = Math.round(104 * scale);

  const boxStyle = {
    width: size,
    height: size,
    ...style,
  };

  const classes = ["pixel-buddy", "pixel-character", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={boxStyle} {...props}>
      {asset.imageUrl ? (
        <img
          className="pixel-character__img"
          src={asset.imageUrl}
          alt={asset.label}
          width={asset.spriteSize.width}
          height={asset.spriteSize.height}
          draggable={false}
        />
      ) : (
        <div
          className="pixel-buddy__sprite pixel-character__sprite"
          aria-label={asset.label}
          role="img"
          style={
            {
              "--sprite-cols": asset.spriteSize.width,
              "--sprite-rows": asset.spriteSize.height,
            } as React.CSSProperties
          }
        >
          {asset.spriteRows?.flatMap((row, rowIndex) =>
            Array.from(row).map((pixel, colIndex) => {
              const color = asset.palette?.[pixel];

              return (
                <span
                  aria-hidden
                  className="pixel-character__cell"
                  key={`${rowIndex}-${colIndex}`}
                  style={
                    color
                      ? ({ "--pixel-color": color } as React.CSSProperties)
                      : undefined
                  }
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
