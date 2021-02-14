export function renderPNG(svg: SVGSVGElement): Promise<Blob> {
	return new Promise<Blob>((resolve, reject) => {
		const canvas = document.createElement("canvas");
		canvas.width = svg.width.baseVal.value;
		canvas.height = svg.height.baseVal.value;
		const ctx = canvas.getContext("2d");

		const blob = new Blob([svg.outerHTML], { type: "image/svg+xml;charset=UTF-8" });
		const url = URL.createObjectURL(blob);

		const image = new Image();
		image.onload = () => {
			ctx.drawImage(image, 0, 0);
			URL.revokeObjectURL(url);
			canvas.toBlob(resolve);
		};
		image.onerror = reject;
		image.src = url;
	});
}