class Score{
    static scoreElement;
    static digitCount = 0;
    static score = 0;

    static initialize() {
        // HTMLからスコアを表示する元となる要素を取得・大きさ設定
        Score.scoreElement = document.getElementById("score");
        Score.scoreElement.style.width = Config.puyoImageWidth * Config.stageCols + 'px';
        Score.scoreElement.style.height = Config.scoreHeight + 'px';
        Score.scoreElement.style.backgroundColor = Config.scoreBackgroundColor;

        // スコア欄に並べられる数字の個数を計算
        Score.digitCount = Math.trunc(Config.stageCols * Config.puyoImageWidth / GameImage.getDigitImageWidth());
        Score.score = 0;

        // スコア表示
        Score.updateScore();
    }

    // スコア表示の更新
    static updateScore() {
        let score = Score.score;
        const scoreElement = Score.scoreElement;
        // scoreElementの中身を空にする
        while (scoreElement.firstChild) {
            scoreElement.firstChild.remove();
        }
        // スコアの下の桁から埋めていく
        for (let i = 0; i < Score.digitCount; i++) {
            // 10で割ったあまりを求めて、一番下の桁を取り出す
            const digit = score % 10;
            // 一番後ろに追加するのではなく、一番前に追加することで、一番下の桁から表示されるようにする
            scoreElement.insertBefore(GameImage.getDigitImage(digit), scoreElement.firstChild);
            // 10で割って次の準備をする
            score = Math.trunc(score / 10);
        }
    }

    // 連鎖時のスコアを加算
    static addComboScore(combo, piece, color) {
        // テーブルの上限を超えた場合、テーブルの一番最後の値を使う
        combo = Math.min(combo, Config.comboBonusTable.length - 1);
        piece = Math.min(piece, Config.pieceBonusTable.length - 1);
        color = Math.min(color, Config.colorBonusTable.length - 1);

        // 倍率を計算：comboBonus+pieceBonus+colorBonus
        let scale = Config.colorBonusTable[combo] + Config.pieceBonusTable[piece] + Config.colorBonusTable[color];
        if (scale === 0) {
            scale = 1;
        }
        // 消した数に倍率をかけて、10倍してスコアに加算
        Score.addScore(scale * piece * 10);
    }

    // スコアに加算
    static addScore(score) {
        Score.score += score;
        Score.updateScore();
    }
}