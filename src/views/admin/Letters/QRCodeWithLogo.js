import React, { useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeWithLogo = ({ url, size, logoUrl }) => {
  const qrRef = useRef(null);
  const logoSize = Math.floor(size * 0.2); // 20% of QR code size

  useEffect(() => {
    const qrSvg = qrRef.current;
    if (!qrSvg) return;

    const logoImg = new Image();
    logoImg.onload = () => {
      const svgNS = "http://www.w3.org/2000/svg";
      const rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", String((size - logoSize) / 2));
      rect.setAttribute("y", String((size - logoSize) / 2));
      rect.setAttribute("width", String(logoSize));
      rect.setAttribute("height", String(logoSize));
      rect.setAttribute("fill", "white");

      const image = document.createElementNS(svgNS, "image");
      image.setAttributeNS("http://www.w3.org/1999/xlink", "href", logoUrl);
      image.setAttribute("x", String((size - logoSize) / 2));
      image.setAttribute("y", String((size - logoSize) / 2));
      image.setAttribute("width", String(logoSize));
      image.setAttribute("height", String(logoSize));

      qrSvg.appendChild(rect);
      qrSvg.appendChild(image);
    };
    logoImg.src = logoUrl;
  }, [size, logoSize, logoUrl]);

  return (
    <div ref={qrRef}>
      <QRCodeSVG value={url} size={size} />
    </div>
  );
};

export default QRCodeWithLogo;