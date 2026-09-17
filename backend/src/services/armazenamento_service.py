import uuid
from pathlib import Path

from fastapi import UploadFile

from src.core.config import Settings

_EXTENSAO_POR_TIPO = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}

_PREFIXO_MEDIA = "/api/media/"


class TipoArquivoInvalidoError(Exception):
    pass


class ArquivoMuitoGrandeError(Exception):
    pass


class ArmazenamentoService:
    def __init__(self, settings: Settings):
        self.base_dir = Path(settings.uploads_dir)
        self.max_bytes = settings.max_upload_size_mb * 1024 * 1024

    async def salvar(self, arquivo: UploadFile, subpasta: str) -> str:
        conteudo = await arquivo.read()
        if len(conteudo) > self.max_bytes:
            raise ArquivoMuitoGrandeError

        tipo = self._detectar_tipo(conteudo)
        if tipo is None:
            raise TipoArquivoInvalidoError

        nome_arquivo = f"{uuid.uuid4()}.{_EXTENSAO_POR_TIPO[tipo]}"
        destino_dir = self.base_dir / subpasta
        destino_dir.mkdir(parents=True, exist_ok=True)
        (destino_dir / nome_arquivo).write_bytes(conteudo)

        return f"{_PREFIXO_MEDIA}{subpasta}/{nome_arquivo}"

    def remover(self, url: str | None) -> None:
        if not url or not url.startswith(_PREFIXO_MEDIA):
            return

        caminho = self.base_dir / url[len(_PREFIXO_MEDIA) :]
        caminho.unlink(missing_ok=True)

    @staticmethod
    def _detectar_tipo(conteudo: bytes) -> str | None:
        if conteudo.startswith(b"\xff\xd8\xff"):
            return "image/jpeg"
        if conteudo.startswith(b"\x89PNG\r\n\x1a\n"):
            return "image/png"
        if conteudo[:4] == b"RIFF" and conteudo[8:12] == b"WEBP":
            return "image/webp"
        return None
