const DEFAULT_EMPTY_TEXT = "No photos selected.";

function removePreviewUrls(container) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  const previous = container.dataset.objectUrls ?? "";
  previous
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => URL.revokeObjectURL(item));
  container.dataset.objectUrls = "";
}

function createPreviewImage(src, alt, caption) {
  const figure = document.createElement("figure");
  figure.className = "upload-preview-item";

  const image = document.createElement("img");
  image.src = src;
  image.alt = alt;
  image.loading = "lazy";
  figure.append(image);

  const note = document.createElement("figcaption");
  note.textContent = caption;
  figure.append(note);

  return figure;
}

export function validateImageFiles(
  fileList,
  { maxFiles = 4, maxSizeMb = 10 } = {}
) {
  const files = Array.from(fileList ?? []).filter((item) => item instanceof File);

  if (files.length > maxFiles) {
    throw new Error(`Select up to ${maxFiles} photo${maxFiles === 1 ? "" : "s"}.`);
  }

  const maxBytes = maxSizeMb * 1024 * 1024;
  files.forEach((file) => {
    if (!String(file.type ?? "").startsWith("image/")) {
      throw new Error(`${file.name} is not a supported image file.`);
    }

    if (file.size > maxBytes) {
      throw new Error(`${file.name} is larger than ${maxSizeMb} MB.`);
    }
  });

  return files;
}

export function renderSelectedImagePreviews(
  container,
  fileList,
  { emptyText = DEFAULT_EMPTY_TEXT } = {}
) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  removePreviewUrls(container);
  container.replaceChildren();

  const files = Array.from(fileList ?? []).filter((item) => item instanceof File);
  if (files.length === 0) {
    const empty = document.createElement("p");
    empty.className = "upload-preview-empty";
    empty.textContent = emptyText;
    container.append(empty);
    return;
  }

  const objectUrls = [];
  files.forEach((file, index) => {
    const objectUrl = URL.createObjectURL(file);
    objectUrls.push(objectUrl);
    container.append(
      createPreviewImage(
        objectUrl,
        file.name || `Selected photo ${index + 1}`,
        file.name || `Photo ${index + 1}`
      )
    );
  });

  container.dataset.objectUrls = objectUrls.join("\n");
}

export function createUploadedImageGallery(urls, { linkLabel = "Open photo" } = {}) {
  const list = Array.isArray(urls)
    ? urls.map((item) => String(item ?? "").trim()).filter(Boolean)
    : [];

  if (list.length === 0) {
    return null;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "upload-preview-grid is-uploaded";

  list.forEach((url, index) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.className = "upload-preview-link";
    anchor.setAttribute("aria-label", `${linkLabel} ${index + 1}`);
    anchor.append(
      createPreviewImage(url, `${linkLabel} ${index + 1}`, `Photo ${index + 1}`)
    );
    wrapper.append(anchor);
  });

  return wrapper;
}

export async function uploadImageFiles(files, { getSignature }) {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  if (typeof getSignature !== "function") {
    throw new Error("Upload signature callback is required.");
  }

  const signature = await getSignature();
  const uploadUrl = String(signature?.uploadUrl ?? "").trim();
  const apiKey = String(signature?.apiKey ?? "").trim();
  const folder = String(signature?.folder ?? "").trim();
  const timestamp = String(signature?.timestamp ?? "").trim();
  const signedValue = String(signature?.signature ?? "").trim();

  if (!uploadUrl || !apiKey || !timestamp || !signedValue) {
    throw new Error("Upload signing response is incomplete.");
  }

  const uploadedUrls = [];

  for (const file of files) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("api_key", apiKey);
    formData.set("timestamp", timestamp);
    formData.set("signature", signedValue);
    if (folder) {
      formData.set("folder", folder);
    }

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const uploadError =
        payload?.error?.message ??
        payload?.error?.description ??
        "Photo upload failed.";
      throw new Error(uploadError);
    }

    const secureUrl = String(payload?.secure_url ?? payload?.url ?? "").trim();
    if (!secureUrl) {
      throw new Error("Photo upload succeeded without a public URL.");
    }

    uploadedUrls.push(secureUrl);
  }

  return uploadedUrls;
}
