"""
Compare database folder names for a volume against recovered folders on disk.

The app stores only each folder's base name, not its full original path. This
script therefore checks whether each database folder name for a volume exists
anywhere under the supplied recovery roots.
"""

from __future__ import annotations

import argparse
import csv
import os
import re
import sys
from pathlib import Path


DEFAULT_ROOTS = ("F:/verified", "F:/.seen")
DEFAULT_VOLUME = "5"
DEFAULT_DATABASE = "test"
DEFAULT_COLLECTION = "directorynames"
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ENV_FILE = PROJECT_ROOT / "backend" / ".env"
DEFAULT_OUTPUT = PROJECT_ROOT / "reports" / "missing_hdd5_folders.csv"
DEFAULT_TEXT_OUTPUT = PROJECT_ROOT / "reports" / "missing_hdd5_folders.txt"


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("\"'")

        if key and key not in os.environ:
            os.environ[key] = value


def normalize_name(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip()).casefold()


def scan_folder_names(roots: list[Path]) -> tuple[set[str], list[tuple[str, str]]]:
    found_names: set[str] = set()
    errors: list[tuple[str, str]] = []

    def on_error(error: OSError) -> None:
        errors.append((getattr(error, "filename", ""), str(error)))

    for root in roots:
        if not root.exists():
            errors.append((str(root), "Path does not exist"))
            continue

        for current_root, dir_names, _file_names in os.walk(root, onerror=on_error):
            for dir_name in dir_names:
                found_names.add(normalize_name(dir_name))

    return found_names, errors


def get_database(client, database_name: str | None):
    if database_name:
        return client[database_name]

    try:
        return client.get_default_database()
    except Exception as exc:
        raise RuntimeError(
            "Could not determine database name from MONGODB_URI. "
            "Pass --database your_database_name."
        ) from exc


def fetch_database_folders(
    mongo_uri: str,
    database_name: str | None,
    collection_name: str,
    volume_name: str,
):
    try:
        from pymongo import MongoClient
    except ImportError as exc:
        raise RuntimeError(
            "Missing Python package 'pymongo'. Install it with: "
            "py -m pip install -r scripts/requirements-check-missing.txt"
        ) from exc

    client = MongoClient(mongo_uri)
    database = get_database(client, database_name)
    collection = database[collection_name]

    query = {
        "volumeName": {
            "$regex": f"^{re.escape(volume_name)}$",
            "$options": "i",
        }
    }
    folders = list(collection.find(query, {"name": 1, "slug": 1, "volumeName": 1}))

    if folders:
        return folders, []

    available_volumes = collection.distinct("volumeName")
    return folders, sorted(str(volume) for volume in available_volumes if volume)


def write_missing_report(output_path: Path, missing_folders: list[dict]) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["name", "volumeName", "slug", "_id"],
        )
        writer.writeheader()

        for folder in missing_folders:
            writer.writerow(
                {
                    "name": folder.get("name", ""),
                    "volumeName": folder.get("volumeName", ""),
                    "slug": folder.get("slug", ""),
                    "_id": str(folder.get("_id", "")),
                }
            )


def write_text_report(
    output_path: Path,
    volume_name: str,
    roots: list[Path],
    database_count: int,
    disk_count: int,
    missing_folders: list[dict],
    scan_errors: list[tuple[str, str]],
) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open("w", encoding="utf-8") as handle:
        handle.write(f"Volume checked: {volume_name}\n")
        handle.write("Scanned folders:\n")
        for root in roots:
            handle.write(f"  - {root}\n")
        handle.write(f"Database folders: {database_count}\n")
        handle.write(f"Folder names found on disk: {disk_count}\n")
        handle.write(f"Missing folders: {len(missing_folders)}\n")
        handle.write("\n")

        if missing_folders:
            handle.write("Missing folder names:\n")
            for folder in missing_folders:
                handle.write(f"  - {folder.get('name', '')}\n")
        else:
            handle.write("No missing folders found.\n")

        if scan_errors:
            handle.write("\nScan warnings:\n")
            for path, message in scan_errors:
                handle.write(f"  - {path}: {message}\n")


def build_parser() -> argparse.ArgumentParser:
    load_env_file(DEFAULT_ENV_FILE)

    parser = argparse.ArgumentParser(
        description=(
            "Find folders that exist in MongoDB for a volume but are missing "
            "from recovered HDD folders."
        )
    )
    parser.add_argument(
        "--volume",
        default=DEFAULT_VOLUME,
        help=f"Volume name to check. Default: {DEFAULT_VOLUME!r}",
    )
    parser.add_argument(
        "--roots",
        nargs="+",
        default=list(DEFAULT_ROOTS),
        help="Folders to scan recursively on the recovered drive.",
    )
    parser.add_argument(
        "--env-file",
        default=str(DEFAULT_ENV_FILE),
        help="Path to the .env file containing MONGODB_URI.",
    )
    parser.add_argument(
        "--database",
        default=os.environ.get("MONGODB_DB", DEFAULT_DATABASE),
        help=f"Mongo database name. Default: {DEFAULT_DATABASE!r}",
    )
    parser.add_argument(
        "--collection",
        default=DEFAULT_COLLECTION,
        help=f"Mongo collection name. Default: {DEFAULT_COLLECTION!r}",
    )
    parser.add_argument(
        "--output",
        default=str(DEFAULT_OUTPUT),
        help="CSV report path for missing folders.",
    )
    parser.add_argument(
        "--text-output",
        default=str(DEFAULT_TEXT_OUTPUT),
        help="Readable text report path.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    env_path = Path(args.env_file)
    roots = [Path(root) for root in args.roots]
    output_path = Path(args.output)
    text_output_path = Path(args.text_output)

    load_env_file(env_path)
    mongo_uri = os.environ.get("MONGODB_URI")

    if not mongo_uri:
        print(
            "MONGODB_URI was not found. Add it to backend/.env or set it in your shell.",
            file=sys.stderr,
        )
        return 2

    actual_names, scan_errors = scan_folder_names(roots)

    try:
        database_folders, available_volumes = fetch_database_folders(
            mongo_uri=mongo_uri,
            database_name=args.database,
            collection_name=args.collection,
            volume_name=args.volume,
        )
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 2

    if not database_folders:
        print(f"No database folders found for volume {args.volume!r}.")
        if available_volumes:
            print("Available volume names:")
            for volume in available_volumes:
                print(f"  - {volume}")
        return 1

    missing_folders = [
        folder
        for folder in database_folders
        if normalize_name(folder.get("name", "")) not in actual_names
    ]
    missing_folders.sort(key=lambda folder: normalize_name(folder.get("name", "")))

    write_missing_report(output_path, missing_folders)
    write_text_report(
        output_path=text_output_path,
        volume_name=args.volume,
        roots=roots,
        database_count=len(database_folders),
        disk_count=len(actual_names),
        missing_folders=missing_folders,
        scan_errors=scan_errors,
    )

    print(f"Volume checked: {args.volume}")
    print(f"Database folders: {len(database_folders)}")
    print(f"Folder names found on disk: {len(actual_names)}")
    print(f"Missing folders: {len(missing_folders)}")
    print(f"CSV report written to: {output_path}")
    print(f"Text report written to: {text_output_path}")

    if scan_errors:
        print("")
        print("Scan warnings:")
        for path, message in scan_errors[:20]:
            print(f"  - {path}: {message}")
        if len(scan_errors) > 20:
            print(f"  ... and {len(scan_errors) - 20} more warnings")

    return 0 if not missing_folders else 1


if __name__ == "__main__":
    raise SystemExit(main())
