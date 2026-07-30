#!/usr/bin/env python3

"""Build a privacy-redacted Genblaze manifest for a synthetic Doream card."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from genblaze_core import (
    Manifest,
    Modality,
    RunBuilder,
    StepBuilder,
    StepStatus,
)
from genblaze_core.models import RunStatus


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _asset_uri(role: str, sha256: str) -> str:
    """Return a portable, privacy-safe URI instead of a local profile path."""

    return f"https://doream.org/provenance/{role}/{sha256}"


def build_manifest(raw_image: Path, dream_card: Path) -> Manifest:
    """Create and verify a two-step, prompt-redacted media lineage."""

    raw_hash = _sha256(raw_image)
    card_hash = _sha256(dream_card)

    generation_step = (
        StepBuilder("doream", "doream-image-generation")
        .prompt("[private prompt redacted]")
        .modality(Modality.IMAGE)
        .params(
            privacy="prompt-redacted",
            artifact_role="synthetic-demo-source",
        )
        .status(StepStatus.SUCCEEDED)
        .asset(
            _asset_uri("synthetic-source", raw_hash),
            "image/png",
            sha256=raw_hash,
        )
        .build()
    )

    render_step = (
        StepBuilder("doream", "doream-prism-card-renderer")
        .prompt("Render a privacy-safe Prism Dream Card from the generated image")
        .modality(Modality.IMAGE)
        .params(
            input_sha256=raw_hash,
            finish_profile="prism-foil",
            private_text_included=False,
        )
        .status(StepStatus.SUCCEEDED)
        .asset(
            _asset_uri("dream-card", card_hash),
            "image/png",
            sha256=card_hash,
        )
        .build()
    )

    run = (
        RunBuilder("dream-provenance-vault")
        .add_step(generation_step)
        .add_step(render_step)
        .status(RunStatus.COMPLETED)
        .build()
    )
    manifest = Manifest.from_run(run)
    if not manifest.verify():
        raise ValueError("Genblaze manifest verification failed")
    return manifest


def write_manifest(manifest: Manifest, output: Path) -> None:
    """Write a stable JSON envelope containing the canonical manifest hash."""

    payload = json.loads(manifest.to_canonical_json())
    payload["canonical_hash"] = manifest.canonical_hash
    payload["verified"] = manifest.verify()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    build_manifest_result = build_manifest(
        project_root / "public" / "sample" / "commute-moon-platform-raw.png",
        project_root / "public" / "sample" / "commute-moon-platform.png",
    )
    output_path = project_root / "public" / "sample" / "genblaze-manifest.json"
    write_manifest(build_manifest_result, output_path)
    print(
        json.dumps(
            {
                "output": str(output_path),
                "canonical_hash": build_manifest_result.canonical_hash,
                "verified": build_manifest_result.verify(),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
