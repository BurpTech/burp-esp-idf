from pathlib import Path
from typing import NewType

RootDirectory = NewType('RootDirectory', Path)
OutputDirectory = NewType('OutputDirectory', Path)
ConfigDict = NewType('ConfigDict', dict)
