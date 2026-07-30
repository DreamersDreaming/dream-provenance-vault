import json
from pathlib import Path

from build_manifest import build_manifest, write_manifest


def test_build_manifest_verifies_two_step_private_pipeline(tmp_path: Path) -> None:
    raw_image = tmp_path / "raw.png"
    dream_card = tmp_path / "card.png"
    raw_image.write_bytes(b"synthetic raw image bytes")
    dream_card.write_bytes(b"synthetic card bytes")

    manifest = build_manifest(raw_image, dream_card)
    serialized = manifest.to_canonical_json()

    assert manifest.verify() is True
    assert manifest.run.status.value == "completed"
    assert len(manifest.canonical_hash) == 64
    assert "doream-image-generation" in serialized
    assert "doream-prism-card-renderer" in serialized
    assert "raw dream text" not in serialized.lower()
    assert "private prompt redacted" in serialized.lower()
    assert "file://" not in serialized.lower()
    assert str(tmp_path).replace("\\", "/").lower() not in serialized.lower()


def test_write_manifest_outputs_canonical_genblaze_json(tmp_path: Path) -> None:
    raw_image = tmp_path / "raw.png"
    dream_card = tmp_path / "card.png"
    output = tmp_path / "genblaze-manifest.json"
    raw_image.write_bytes(b"raw")
    dream_card.write_bytes(b"card")

    manifest = build_manifest(raw_image, dream_card)
    write_manifest(manifest, output)

    parsed = json.loads(output.read_text(encoding="utf-8"))
    assert parsed["canonical_hash"] == manifest.canonical_hash
    assert output.read_text(encoding="utf-8").endswith("\n")
