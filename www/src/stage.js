class Stage {
    static stageElement = null;
    static puyoBoard = null;
    static puyoCount = 0;
    static fallingPuyoInfoList = [];
    static erasingStartFrame = 0;
    static erasingInfoList = [];
    static zenkeshiImage = null;
    static nextElement = null;
    static nextPuyoColors = [];
    static nextPuyoElements = [];

    static initialize() {
        // HTMLからステージの元となる要素を取得し、大きさを設定する
        Stage.stageElement = document.getElementById("stage");
        Stage.stageElement.style.width = Config.puyoImageWidth * Config.stageCols + 'px';
        Stage.stageElement.style.height = Config.puyoImageHeight * Config.stageRows + 'px';
        Stage.stageElement.style.backgroundColor = Config.stageBackgroundColor;

        // ネクストぷよを表示する要素を取得し、大きさを設定
        const nextContainerElement = document.getElementById("next");
        nextContainerElement.style.width = Config.puyoImageWidth * Config.stageCols + 'px';
        nextContainerElement.style.height = Config.puyoImageHeight * 2.2 + 'px';
        nextContainerElement.style.backgroundColor = Config.nextBackgroundColor;

        // 実際にネクストぷよを格納する要素を作成し、画面に追加
        const borderWidth = 2;
        Stage.nextElement = document.createElement("div");
        Stage.nextElement.style.position = "absolute";
        Stage.nextElement.style.left = (Config.puyoImageWidth * (Config.stageCols -1)) / 2 - borderWidth + 'px';
        Stage.nextElement.style.top = (Config.puyoImageHeight * 0.1) - borderWidth + 'px';
        Stage.nextElement.style.width = Config.puyoImageWidth * 1 + 'px';
        Stage.nextElement.style.height = Config.puyoImageWidth * 2 + 'px';
        Stage.nextElement.style.border = borderWidth + 'px solid #ff8';
        Stage.nextElement.style.borderRadius = Config.puyoImageWidth * 0.2 + 'px';
        Stage.nextElement.style.backgroundColor = "rgba(0, 0, 0.5)";
        nextContainerElement.appendChild(Stage.nextElement); 

        // 全消し時の画像を用意
        Stage.zenkeshiImage = document.getElementById("zenkeshi");
        Stage.zenkeshiImage.width = Config.puyoImageWidth * Config.stageCols;
        Stage.zenkeshiImage.style.position = 'absolute';
        Stage.zenkeshiImage.style.opacity = '0';
        Stage.stageElement.appendChild(Stage.zenkeshiImage);

        // ぷよぷよ盤の初期化
        Stage.puyoCount = 0;
        Stage.puyoBoard = [];
        for (let y = 0; y < Config.stageRows; y++) {
            Stage.puyoBoard[y] = [];
            for (let x = 0; x < Config.stageCols; x++) {
                Stage.puyoBoard[y][x] = null;
            }
        }
        
        // もし初期状態ステージ情報があれば、その情報に基づくぷよを配置
        for (let y = 0; y < Config.stageRows; y++) {
            for (let x = 0; x < Config.stageCols; x++) {
                let puyoColor = 0;
                if (Config.initialBoard && Config.initialBoard[y][x]) {
                    puyoColor = Config.initialBoard[y][x];
                }
                if (puyoColor >= 1 && puyoColor <= Config.puyoColorMax) {
                    Stage.createPuyo(x, y, puyoColor);
                }
            }
        }

        // 最初のネクストぷよを作成
        Stage.nextPuyoColors = [];
        Stage.nextPuyoElements = [];
        Stage.getNextPuyoColors();
    }

    // 現在のネクストぷよを返し、新しいネクストぷよを作成・画面表示
    static getNextPuyoColors() {
        // 現在のネクストぷよの色を返り値用に退避
        const ret = Stage.nextPuyoColors;
        // 新しいネクストぷよの色を決める
        const nextCenterPuyoColor = Math.trunc(Math.random() * Config.puyoColorMax) + 1;
        const nextRotaingPuyoColor = Math.trunc(Math.random() * Config.puyoColorMax) + 1;
        Stage.nextPuyoColors = [nextCenterPuyoColor, nextRotaingPuyoColor];

        // ネクストぷよがなければ、初回なので画面描画不要
        if (ret.length) {
            // ネクストぷよがあったので、新しいネクストぷよを画面に描画
            // 現在のネクストぷよを削除
            for (const element of Stage.nextPuyoElements) {
                element.remove();
            }
            // 新しくネクストぷよを配置
            const nextCenterPuyoElement = GameImage.getPuyoImage(nextCenterPuyoColor);
            const nextRotatingPuyoElement = GameImage.getPuyoImage(nextRotaingPuyoColor);
            nextCenterPuyoElement.style.top = Config.puyoImageHeight + 'px';
            Stage.nextElement.append(nextCenterPuyoElement, nextRotatingPuyoElement);
            Stage.nextPuyoElements = [nextCenterPuyoElement, nextRotatingPuyoElement]; 
        }
        return ret;
    }

    // ぷよを新たに作り、画面上とぷよぷよ盤の両方にセットする
    static createPuyo(x, y, puyoColor) {
        // 画像を作成し、画面上の適切な位置に配置
        const puyoImage = GameImage.getPuyoImage(puyoColor);
        puyoImage.style.left = x * Config.puyoImageWidth + "px";
        puyoImage.style.top = y * Config.puyoImageHeight + "px";
        Stage.stageElement.appendChild(puyoImage);

        // ぷよぷよ盤に情報を保存
        Stage.puyoBoard[y][x] = {
            puyoColor: puyoColor,
            element: puyoImage
        }
        //ぷよの総数を追加
        Stage.puyoCount++;
    }


    // ぷよぷよ盤にぷよ情報をセット
    static setPuyoInfo(x, y, info) {
        Stage.puyoBoard[y][x] = info;
    }

    // ぷよぷよ盤の情報を返す
    static getPuyoInfo(x, y) {
        // 左右、底の場合はダミーぷよを返す
        if (x < 0 || x >= Config.stageCols || y >= Config.stageRows) {
            return {
                puyoColor: -1
            };
        }
        // y座標がマイナス(ぷよぷよ盤の上)の場合、空白扱い
        if (y < 0) {
            return null;
        }
        // それ以外(ぷよぷよ盤内)の場合、ぷよぷよ盤の情報をそのまま返す
        return Stage.puyoBoard[y][x];
    }

    // ぷよぷよ盤からぷよ情報を消す
    static removePuyoInfo(x, y) {
        Stage.puyoBoard[y][x] = null;
    }


    // 自由落下するぷよの存在確認
    static checkFallingPuyo() {
        Stage.fallingPuyoInfoList = []

        // 下から上に向かってチェック
        for (let y = Config.stageRows - 2 ; y >= 0; y--) {
            for (let x = 0; x < Config.stageCols; x++) {
                const currentPuyoInfo = Stage.getPuyoInfo(x, y);
                // 現在のマスにぷよがなければ飛ばす
                if (!currentPuyoInfo) {
                    continue;
                }
                const belowPuyoInfo = Stage.getPuyoInfo(x, y+1);
                // 下が空白なので落下
                if (!belowPuyoInfo) {

                    // ぷよぷよ盤から現在のぷよを削除
                    Stage.removePuyoInfo(x, y);

                    // 自由落下でどこまで落下するか
                    let destination = y;
                    while (!Stage.getPuyoInfo(x, destination+1)) {
                        destination++;
                    }
                    // 最終落下地点に置く
                    Stage.setPuyoInfo(x, destination, currentPuyoInfo);
                    // 「落ちるぷよリスト」に「落ちるぷよ情報」を追加
                    Stage.fallingPuyoInfoList.push({
                        element: currentPuyoInfo.element,
                        position: y * Config.puyoImageHeight,
                        destination: destination * Config.puyoImageHeight,
                        falling: true
                    });
                }
            }
        }
        return (Stage.fallingPuyoInfoList.length > 0);
    }

    // 自由落下させる
    static fallPuyo(){
        let isFalling = false;
        for (const fallingPuyoInfo of Stage.fallingPuyoInfoList) {
            // 自由落下終了後
            if (!fallingPuyoInfo.falling) {
                continue;
            }
            // 現在の画面上のY座標を取得して、自由落下分追加
            let position = fallingPuyoInfo.position;
            position += Config.fallingSpeed;
            // 自由落下終了
            if (position >= fallingPuyoInfo.destination) {
                position = fallingPuyoInfo.destination;
                fallingPuyoInfo.falling = false;
            }else{
                // 落下中ぷよを保存
                isFalling = true;
            }
            // 新しい位置を保存
            fallingPuyoInfo.position = position;
            // ぷよを動かす
            fallingPuyoInfo.element.style.top = position + 'px';
        }
        return isFalling;
    }

    // 消せるかどうか判定
    static checkPuyoErase(startFrame) {
        Stage.eraseStartFrame = startFrame;
        Stage.erasingInfoList = [];

        // 何色のぷよを消したか記録
        const erasedPuyoColorBin = {};

        // 隣接ぷよを確認する関数内関数
        const checkConnectedPuyo = (x, y, connectedInfoList = []) => {
            // ぷよがあるか確認
            const originalPuyoInfo = Stage.getPuyoInfo(x, y);
            // ないなら、何もしない
            if (!originalPuyoInfo) {
                return connectedInfoList;
            }
            // あるなら、ぷよぷよ盤から一時除外
            connectedInfoList.push({
                x: x,
                y: y,
                puyoInfo: originalPuyoInfo
            });
            Stage.removePuyoInfo(x, y);

            // 4方向(上下左右)のぷよを確認
            const directionList = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            for (const direction of directionList) {
                const dx = x + direction[0];
                const dy = y + direction[1];
                const puyoInfo = Stage.getPuyoInfo(dx, dy);
                if (!puyoInfo || puyoInfo.puyoColor !== originalPuyoInfo.puyoColor) {
                    // ぷよの色が異なる
                    continue;
                }
                // 同色のぷよなら、そのぷよの周りのぷよも消せるか確認する
                checkConnectedPuyo(dx, dy, connectedInfoList);
            }
            return connectedInfoList;
        };

        const remainingInfoList = [];
        // 一つ一つぷよを確認→消せるか判断
        for (let y = 0; y < Config.stageRows; y++) {
            for (let x = 0; x < Config.stageCols; x++) {
                const puyoInfo = Stage.getPuyoInfo(x, y);
                const connectedInfoList = checkConnectedPuyo(x, y);
                if (connectedInfoList.length < Config.erasePuyoCount) {
                    // 連続していないor連続しているが基準以下
                    if (connectedInfoList.length) {
                        // 消さないで戻すリストに追加
                        remainingInfoList.push(...connectedInfoList);
                    }
                } else {
                    if (connectedInfoList.length) {
                        // 消すリストに追加する
                        Stage.erasingInfoList.push(...connectedInfoList);
                        erasedPuyoColorBin[puyoInfo.puyoColor] = true;
                    }
                }
            }
        }

        // 全体のぷよ個数から、今回消したぷよ個数を引いておく
        Stage.puyoCount -= Stage.erasingInfoList.length;

        // 消さないで戻すリストにはいっていたぷよを戻す
        for (const info of remainingInfoList) {
            Stage.setPuyoInfo(info.x, info.y, info.puyoInfo);
        }

        if (Stage.erasingInfoList.length) {
            // 消せるなら、消えるぷよの個数と色情報をまとめて返す
            return {
                piece: Stage.erasingInfoList.length,
                color: Object.keys(erasedPuyoColorBin).length
            };
            return null;
        }
    }

    // 消すアニメーション
    static erasePuyo(frame) {
        const elapsedFrame = frame - Stage.eraseStartFrame;
        const ratio = elapsedFrame / Config.eraseAnimationFrames;
        if (ratio >= 1) {
            // アニメーションを終了
            for (const info of Stage.erasingInfoList) {
                var element = info.puyoInfo.element;
                Stage.stageElement.removeChild(element);
            }
            return false;
        } else if (ratio >= 0.75) {
            for (const info of Stage.erasingInfoList) {
                var element = info.puyoInfo.element;
                element.style.display = 'block';
            }
            return true;
        } else if (ratio >= 0.50) {
            for (const info of Stage.erasingInfoList) {
                var element = info.puyoInfo.element;
                element.style.display = 'none';
            }
            return true;
        } else if (ratio >= 0.25) {
            for (const info of Stage.erasingInfoList) {
                var element = info.puyoInfo.element;
                element.style.display = 'block';
            }
            return true;
        } else {
            for (const info of Stage.erasingInfoList) {
                var element = info.puyoInfo.element;
                element.style.display = 'block';
            }
            return true;
        }
    }

    // 全消しの表示を開始
    static showZenkeshi() {
        Stage.zenkeshiImage.style.transition = 'none';
        Stage.zenkeshiImage.style.opacity = '1';
        Stage.zenkeshiImage.style.top = Config.puyoImageHeight * Config.stageRows + "px";
        Stage.zenkeshiImage.offsetHeight; // 一度、表示の確定

        Stage.zenkeshiImage.style.transition = "top " + Config.zenkeshiDuration + "ms linear";
        Stage.zenkeshiImage.style.top = Config.puyoImageHeight * Config.stageRows / 3 + "px";
    }

    // 全消しの画像を画面上から消す
    static hideZenkeshi() {
        Stage.zenkeshiImage.style.transition = "opacity" + Config.zenkeshiDuration + "ms linear";
        Stage.zenkeshiImage.style.opacity = '0';
    }
}