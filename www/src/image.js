class GameImage {
    static puyoImageList = null;
    static digitImageList = null;

    static initialize() {
        // ぷよ画像を準備する
        GameImage.puyoImageList = []
        for (let i = 0; i < Config.puyoColorMax; i++) {
            const image = document.getElementById("puyo_" + (i+1));
            image.removeAttribute('id');
            image.width = Config.puyoImageWidth;
            image.height = Config.puyoImageHeight;
            image.style.position = 'absolute';
            GameImage.puyoImageList[i] = image;
        }

        // スコアの数字画像準備
        GameImage.digitImageList = []
        for (let i = 0; i < 10; i++) {
            const image = document.getElementById("font_" + i);
            image.removeAttribute('id');

            // 数字画像の高さをそろえる
            const width = image.width / image.height * Config.scoreHeight;
            image.width = width;
            image.height = Config.scoreHeight;

            GameImage.digitImageList[i] = image;
        }
    }

    // ぷよ画像を複製して返す
    static getPuyoImage(color) {
        const image = GameImage.puyoImageList[color - 1].cloneNode(true);
        return image;
    }

    // 数字画像を複製
    static getDigitImage(digit) {
        const image = GameImage.digitImageList[digit].cloneNode(true);
        return image;
    }

    // 数字画像の情報を渡す
    static getDigitImageWidth() {
        return GameImage.digitImageList[0].width;
    }
}