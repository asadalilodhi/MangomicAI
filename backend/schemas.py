"""
schemas.py — Strict Pydantic models for the Visual Novel Extractor Agent.
Every field is typed and documented so the LLM knows exactly what to fill.
"""

from __future__ import annotations
from enum import Enum
from typing import Optional
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field


# ─────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────

class StyleTemplate(str, Enum):
    MANGA          = "Manga"
    COMIC          = "Comic"
    NOIR           = "Noir"
    PHOTOREALISTIC = "Photorealistic"
    ANIME          = "Anime"
    ANIMATION      = "Animation"


class Gender(str, Enum):
    MALE    = "male"
    FEMALE  = "female"
    NON_BINARY = "non_binary"
    UNKNOWN = "unknown"


class EmotionTag(str, Enum):
    NEUTRAL   = "neutral"
    HAPPY     = "happy"
    SAD       = "sad"
    ANGRY     = "angry"
    FEARFUL   = "fearful"
    SURPRISED = "surprised"
    DISGUSTED = "disgusted"
    ANXIOUS   = "anxious"
    EXCITED   = "excited"
    COLD      = "cold"


# ─────────────────────────────────────────────
# Sub-models
# ─────────────────────────────────────────────

class DialogueLine(BaseModel):
    character_id: str = Field(
        ...,
        description="ID of the character speaking. Must match a Character.id in the cast."
    )
    text: str = Field(
        ...,
        description="The exact line of dialogue spoken by the character."
    )
    emotion: str = Field(
        ...,
        description="Dominant emotion for this line. Routed to ElevenLabs for voice modulation."
    )
    intensity: float = Field(
        ...,
        ge=0.0, le=1.0,
        description="Emotional intensity 0.0 (flat) → 1.0 (peak). Used to adjust voice delivery."
    )


class Panel(BaseModel):
    panel_number: int = Field(..., ge=1, le=10, description="Panel index, 1-based.")
    scene_description: str = Field(
        ...,
        description=(
            "Rich visual description of the scene: setting, lighting, character positions, "
            "mood, and any important visual elements. Used as the image generation prompt."
        )
    )
    characters_present: list[str] = Field(
        default_factory=list,
        description="List of character IDs visible in this panel."
    )
    dialogue: list[DialogueLine] = Field(
        default_factory=list,
        description="Ordered list of dialogue lines spoken in this panel."
    )
    narration: Optional[str] = Field(
        None,
        description="Optional narrator caption text shown at the top/bottom of the panel."
    )


class Character(BaseModel):
    id: str = Field(
        ...,
        description="Unique snake_case identifier, e.g. 'zark_the_detective'. Stable across all panels."
    )
    name: str = Field(..., description="Character's display name.")
    gender: Gender = Field(
        Gender.UNKNOWN,
        description="Character gender. Infer from context if not explicitly stated."
    )
    personality: str = Field(
        ...,
        description="Short personality summary, e.g. 'grumpy, sarcastic, fiercely loyal'."
    )
    visual_description: str = Field(
        ...,
        description=(
            "Detailed visual description used for image generation consistency: "
            "age, build, hair, eyes, clothing, distinctive features."
        )
    )
    voice_type: str = Field(
        ...,
        description=(
            "Voice descriptor for ElevenLabs selection, e.g. 'deep, raspy, ancient' "
            "or 'soft, breathy, melodic'."
        )
    )
    role: Optional[str] = Field(
        None,
        description="Story role: protagonist, antagonist, mentor, comic relief, etc."
    )


class StoryObject(BaseModel):
    id: str = Field(..., description="Unique snake_case identifier for the object.")
    name: str = Field(..., description="Display name of the object.")
    description: str = Field(
        ...,
        description="Visual and narrative description. Why does it matter to the story?"
    )


# ─────────────────────────────────────────────
# Root model
# ─────────────────────────────────────────────

class StoryExtraction(BaseModel):
    """
    The single source of truth for the entire visual novel.
    Once is_complete=True this object is locked and passed to Genblaze.
    """

    # ── Identity ──────────────────────────────
    title: Optional[str] = Field(None, description="Working title of the visual novel.")
    genre: Optional[str] = Field(
        None,
        description="Primary genre(s), e.g. 'Cyberpunk Noir', 'Romantic Comedy', 'Dark Fantasy'."
    )
    style_template: Optional[StyleTemplate] = Field(
        None,
        description="Visual rendering style. Must be one of the StyleTemplate enum values."
    )

    # ── World ─────────────────────────────────
    core_premise: Optional[str] = Field(
        None,
        description="2-3 sentence story premise: the world, the conflict, what's at stake."
    )
    setting: Optional[str] = Field(
        None,
        description="Primary setting description: time period, location, atmosphere."
    )

    # ── Cast & Props ──────────────────────────
    characters: list[Character] = Field(
        default_factory=list,
        description="All named characters. Each must have a stable unique id."
    )
    objects: list[StoryObject] = Field(
        default_factory=list,
        description="Important objects / MacGuffins relevant to the story."
    )

    # ── Script ────────────────────────────────
    panels: list[Panel] = Field(
        default_factory=list,
        description=(
            "The 10-panel script. Each panel must have a scene_description. "
            "Dialogue lines MUST include emotion and intensity tags."
        )
    )

    # ── Control flags ─────────────────────────
    is_complete: bool = Field(
        False,
        description=(
            "Set True ONLY when ALL required fields are filled and the 10-panel "
            "script is fully written. Never set True if any field is None or missing."
        )
    )
    missing_fields: list[str] = Field(
        default_factory=list,
        description=(
            "List of field paths that are still missing or ambiguous, "
            "e.g. ['characters[0].visual_description', 'genre', 'panels']. "
            "Must be empty when is_complete=True."
        )
    )
    director_note: Optional[str] = Field(
        None,
        description=(
            "Internal reasoning note from the Extractor: what was just inferred, "
            "updated, or contradicted. Not shown to user."
        )
    )
