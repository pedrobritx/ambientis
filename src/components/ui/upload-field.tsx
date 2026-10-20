"use client";
import { useId, useRef, useState } from "react";
import { Upload, Camera, ImageIcon } from "./icons";
import { m } from "../../messages/pt-BR";
export function UploadField({
  label,
  disabled,
  onFile,
}: {
  label: string;
  disabled?: boolean;
  onFile: (file: File) => Promise<boolean>;
}) {
  const id = useId();
  const files = useRef<HTMLInputElement>(null);
  const library = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  async function pick(input: HTMLInputElement) {
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setMessage("Lendo arquivo…");
    const saved = await onFile(file);
    setMessage(
      saved
        ? `Adicionado: ${file.name}`
        : "Arquivo não adicionado. Confira o formato, o tamanho e a mensagem no início da página.",
    );
  }
  const imageTypes = "image/jpeg,image/png,image/webp,image/heic,image/heif";
  return (
    <div className="upload-field" role="group" aria-labelledby={id}>
      <strong id={id}>{label}</strong>
      <p id={`${id}-hint`}>
        {m.uploadLimit} O original é preservado neste navegador.
      </p>
      <div className="upload-actions">
        <button
          type="button"
          className="secondary"
          disabled={disabled}
          onClick={() => files.current?.click()}
        >
          <Upload size={20} />
          Selecionar arquivo
        </button>
        <button
          type="button"
          className="secondary"
          disabled={disabled}
          onClick={() => library.current?.click()}
        >
          <ImageIcon size={20} />
          Biblioteca de fotos
        </button>
        <button
          type="button"
          className="secondary"
          disabled={disabled}
          onClick={() => camera.current?.click()}
        >
          <Camera size={20} />
          Tirar foto
        </button>
      </div>
      <input
        ref={files}
        className="visually-hidden"
        tabIndex={-1}
        type="file"
        aria-label={label}
        aria-describedby={`${id}-hint`}
        accept={`.pdf,.txt,${imageTypes}`}
        disabled={disabled}
        onChange={(e) => void pick(e.currentTarget)}
      />
      <input
        ref={library}
        className="visually-hidden"
        tabIndex={-1}
        type="file"
        aria-label="Selecionar foto da biblioteca"
        accept={imageTypes}
        disabled={disabled}
        onChange={(e) => void pick(e.currentTarget)}
      />
      <input
        ref={camera}
        className="visually-hidden"
        tabIndex={-1}
        type="file"
        aria-label="Capturar foto"
        accept="image/*"
        capture="environment"
        disabled={disabled}
        onChange={(e) => void pick(e.currentTarget)}
      />
      <small>
        A câmera depende do navegador e do dispositivo. Neste ensaio, escolha
        apenas arquivos ou fotos fictícias.
      </small>
      {message && <p role="status">{message}</p>}
    </div>
  );
}
