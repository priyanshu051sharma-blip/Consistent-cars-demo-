import React, { useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
};

const ImageGallery: React.FC<Props> = ({ images }) => {
  const [selected, setSelected] = useState(images[0]);

  return (
    <div>
      <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
        <Image
          src={selected}
          alt="Selected Image"
          layout="fill"
          objectFit="cover"
          className="transition-all duration-300"
        />
      </div>

      <div className="flex gap-4 mt-4 overflow-x-auto">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`w-24 h-24 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
              img === selected ? "border-blue-400" : "border-gray-300"
            }`}
            onClick={() => setSelected(img)}
          >
            <Image
              src={img}
              alt={`Thumbnail ${idx}`}
              width={96}
              height={96}
              objectFit="cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
