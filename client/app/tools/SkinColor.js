/**
 * Created by timothee on 11/04/2016.
 */

export class SkinColor {
    constructor(img) {
        this.originalLinkColor = SkinColor.hexToRGB("#b8f818");
        this.canvas = document.createElement("canvas");
        this.canvas.width = img.naturalWidth;
        this.canvas.height = img.naturalHeight;
        this.ctx = this.canvas.getContext("2d");

        this.pixels = this.getPixels(img);
    }

    // Load the Link image given the img tag
    getPixels(img) {
        this.ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, img.naturalWidth, img.naturalHeight);
        return {
            original : this.ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight),
            after    : this.ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
        };
    }

    // Transform hex color to RGB
    static hexToRGB(hex) {
        var long = parseInt(hex.replace(/^#/, ""), 16);
        return {
            R: (long >>> 16) & 0xff,
            G: (long >>> 8) & 0xff,
            B: long & 0xff
        };
    }

    changeColor(colorPickerValue) {
        console.log(colorPickerValue);
        let newColor = SkinColor.hexToRGB(colorPickerValue);

        for(var I = 0, L = this.pixels.original.data.length; I < L; I += 4) {
            // If pixel not transparent
            if(this.pixels.original.data[I+3] > 0) {
                // If pixel color is like #b8f818
                if (this.pixels.original.data[I] === this.originalLinkColor.R
                    && this.pixels.original.data[I+1] === this.originalLinkColor.G
                    && this.pixels.original.data[I+2] === this.originalLinkColor.B) {

                    this.pixels.after.data[I] = newColor.R;
                    this.pixels.after.data[I+1] = newColor.G;
                    this.pixels.after.data[I+2] = newColor.B;
                }
            }
        }

        this.ctx.putImageData(this.pixels.after, 0, 0);
        let finalImage = document.createElement('img');
        finalImage.src = this.canvas.toDataURL();
        return finalImage;
    }
}
