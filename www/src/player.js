class Player {
    static centerPuyoColor = 0;
    static rotatingPuyoColor = 0;
    static playerPuyoStatus = null;
    static centerPuyoElement = null;
    static rotatingPuyoElement = null;
    static groundedFrame = 0;
    static keyStatus = null;
    static actionStartFrame = 0;
    static moveSource = 0;
    static moveDestination = 0;
    static rotateBeforeLeft = 0;
    static rotateAfterLeft = 0;
    static rotateFromRotation = 0;

    static initialize() {
        // キーボードの入力を確認
        Player.keyStatus = {
            right: false,
            left: false,
            up: false,
            down: false
        };
        // ブラウザのキーボード入力を取得するイベントリスナを登録
        document.addEventListener('keydown', (event) => {
            // キーボードが押された場合
            switch (event.key) {
                case 'ArrowLeft':
                    Player.keyStatus.left = true;
                    event.preventDefault();
                    return;
                case 'a':
                    Player.keyStatus.left = true;
                    event.preventDefault();
                    return;
                case 'ArrowUp':
                    Player.keyStatus.up = true;
                    event.preventDefault();
                    return;
                case 'w':
                    Player.keyStatus.up = true;
                    event.preventDefault();
                    return;
                case 'ArrowRight':
                    Player.keyStatus.right = true;
                    event.preventDefault();
                    return;
                case 'd':
                    Player.keyStatus.right = true;
                    event.preventDefault();
                    return;
                case 'ArrowDown':
                    Player.keyStatus.down = true;
                    event.preventDefault();
                    return;
                case 's':
                    Player.keyStatus.down = true;
                    event.preventDefault();
                    return;
            }
        });
        document.addEventListener('keyup', (event) => {
            // キーボードが離された場合
            switch(event.key){
                case 'ArrowLeft':
                    Player.keyStatus.left = false;
                    event.preventDefault();
                    return;
                case 'a':
                    Player.keyStatus.left = false;
                    event.preventDefault();
                    return;
                case 'ArrowUp':
                    Player.keyStatus.up = false;
                    event.preventDefault();
                    return;
                case 'w':
                    Player.keyStatus.up = false;
                    event.preventDefault();
                    return;
                case 'ArrowRight':
                    Player.keyStatus.right = false;
                    event.preventDefault();
                    return;
                case 'd':
                    Player.keyStatus.right = false;
                    event.preventDefault();
                    return;
                case 'ArrowDown':
                    Player.keyStatus.down = false;
                    event.preventDefault();
                    return;
                case 's':
                    Player.keyStatus.down = false;
                    event.preventDefault();
                    return;
            }
        });
    }

    // プレイヤーが操作するぷよを作成
    static createPlayerPuyo() {
        // ぷよがおけるかどうか、1番上の段の左から３つ目
        if (Stage.getPuyoInfo(2, 0)) {
            // 空白でない→新しいぷよを置けない(ゲームオーバー)
            return false;
        }

        // 新しいぷよの色をネクストぷよから取得
        const nextPuyoColors = Stage.getNextPuyoColors();
        Player.centerPuyoColor = nextPuyoColors[0];
        Player.rotatingPuyoColor = nextPuyoColors[1];

        // 新しいぷよの画像を作成
        Player.centerPuyoElement = GameImage.getPuyoImage(Player.centerPuyoColor);
        Player.rotatingPuyoElement = GameImage.getPuyoImage(Player.rotatingPuyoColor);
        Stage.stageElement.appendChild(Player.centerPuyoElement);
        Stage.stageElement.appendChild(Player.rotatingPuyoElement);

        // ぷよの初期情報を定める
        Player.playerPuyoStatus = {
            x: 2, // 中心ぷよの位置：左から２番目
            y: -1, // 画面上部ギリギリから出てくる
            left: 2 * Config.puyoImageWidth,
            top: -1 * Config.puyoImageHeight,
            dx: 0, // 中心ぷよから見た回転するぷよの相対位置：回転するぷよは上方向(0，-1)
            dy: -1,
            rotation: 90 // 画面上の回転するぷよの角度：90度(上向き)
        };
        // 接地時間は0
        Player.groundedFrame = 0;
        // ぷよを描画
        Player.setPlayerPuyoPosition();
        return true;
    }

    // playerPuyoStatusに従って、画面上のぷよの位置を更新
    static setPlayerPuyoPosition() {
        // まず中心ぷよの位置を確定させる
        Player.centerPuyoElement.style.left = Player.playerPuyoStatus.left + 'px';
        Player.centerPuyoElement.style.top = Player.playerPuyoStatus.top + 'px';

        // 回転するぷよの位置を計算
        const x = Player.playerPuyoStatus.left + Math.cos(Player.playerPuyoStatus.rotation * Math.PI / 180) * Config.puyoImageWidth;
        const y = Player.playerPuyoStatus.top - Math.sin(Player.playerPuyoStatus.rotation * Math.PI / 180) * Config.puyoImageHeight;
        Player.rotatingPuyoElement.style.left = x + 'px';
        Player.rotatingPuyoElement.style.top = y + 'px';
    }

    // プレイヤーが操作するぷよを落下させる
    static dropPlayerPuyo(isPressingDown) {
        let {x, y, dx, dy} = Player.playerPuyoStatus;

        // 現状のプレイヤーが操作するぷよの下にぷよがあるか確認
        if (!Stage.getPuyoInfo(x, y + 1) && !Stage.getPuyoInfo(x + dx, y + dy + 1)) {
            // 中心ぷよ・回転ぷよ両方の下にぷよがないので自由落下
            Player.playerPuyoStatus.top += Config.playerFallingSpeed;
            if (isPressingDown) {
                Player.playerPuyoStatus.top += Config.playerDownSpeed;
            }
            // 自由落下でマスの境を超えていないか確認
            if (Math.floor(Player.playerPuyoStatus.top / Config.puyoImageHeight) != y) {
                // マスの境を超えたので自分の位置を1つ下げる
                y += 1;
                Player.playerPuyoStatus.y = y;
                // 下キーが押されていたらスコアを加算
                if (Player.keyStatus.down) {
                    Score.addScore(1);
                }
                // 下にぷよがないか再確認
                if (!Stage.getPuyoInfo(x, y + 1) && !Stage.getPuyoInfo(x + dx, y + dy + 1)) {
                    // 境を超え、下にぷよがないので接地していないよう設定・自由落下
                    Player.groundedFrame = 0;
                    return false;
                } else {
                    // 境を超え、ぷよにぶつかった。位置を調整し、接地を開始
                    Player.playerPuyoStatus.top = y * Config.puyoImageHeight;
                    Player.groundedFrame = 1;
                    return false;
                }
            } else {
                // 自由落下でマスの境を越えなかった。接地していないよう設定・自由落下
                Player.groundedFrame = 0
                return false;
            }
        } else {
            // プレイヤーが操作するぷよの下にぷよがあるので接地
            if (Player.groundedFrame === 0){
                // 初接地である。接地を開始
                Player.groundedFrame = 1
                return false;
            } else {
                // 接地中である。接地の時間を増加
                Player.groundedFrame ++;
                if (Player.groundedFrame > Config.playerLockDelayFrames) {
                    // 接地して一定時間経過。この位置で固定
                    return true;                    
                } else {
                    return false;
                }
            }
        }
    }

    // イベントループで現在の状況を更新
    static update(frame) {
        // プレイヤーが操作するぷよを落下
        if (Player.dropPlayerPuyo(Player.keyStatus.down)) {
            // 接地が終わったら固定
            return "fix";
        }
        // ぷよの位置を更新
        Player.setPlayerPuyoPosition();

        // 左右キーの押下を確認
        if (Player.keyStatus.right || Player.keyStatus.left) {
            // 左右を確認
            const mx = (Player.keyStatus.right) ? 1 : -1;
            const cx = Player.playerPuyoStatus.x;
            const cy = Player.playerPuyoStatus.y;
            const rx = cx + Player.playerPuyoStatus.dx;
            const ry = cy + Player.playerPuyoStatus.dy;

            // 動かしたい方向にブロックがないことを確認
            let canMove = true;

            // プレイヤーが操作する中心ぷよの左右確認
            if (Stage.getPuyoInfo(cx + mx, cy)) {
                // ぷよが存在して動かせない
                canMove = false;
            }
            // プレイヤーが操作する回転ぷよの左右確認
            if (Stage.getPuyoInfo(rx + mx, ry)) {
                // ぷよが存在し動かせない
                canMove = false;
            }
            // 接地していない場合、1個下のマスの左右確認
            if (Player.groundedFrame === 0) {
                // 中心ぷよの左右確認
                if (Stage.getPuyoInfo(cx + mx, cy + 1)) {
                    // ぷよが存在して動かせない
                    canMove = false;
                }
                // 回転ぷよの左右確認
                if (Stage.getPuyoInfo(rx + mx, ry + 1)) {
                    // ぷよが存在して動かせない
                    canMove = false;
                }
            }

            if (canMove) {
                // 動かしたい方向に動かすことができるので、移動先情報をセットして移動状態にする
                Player.actionStartFrame = frame,
                Player.moveSource = cx * Config.puyoImageWidth;
                Player.moveDestination = (cx + mx) * Config.puyoImageWidth;
                Player.playerPuyoStatus.x += mx;
                return 'moving';
            }
        } else if (Player.keyStatus.up) {
            // 回転を確認
            // 仮想的に回転させる
            const x = Player.playerPuyoStatus.x;
            // プレイヤーが操作するぷよが設置しておらず、落下している場合、一つ下のマスを基準にする
            const y = Player.playerPuyoStatus.y + (Player.groundedFrame === 0 ? 1 : 0);
            const rotation = Player.playerPuyoStatus.rotation;
            let canRotate = true;

            let cx = 0;
            let cy = 0;
            if (rotation === 0) {
                // 右から上：100％回転可能
            } else if (rotation === 90) {
                // 上から左：左にぷよがあれば右に移動させる必要がある
                // 左を確認
                if (Stage.getPuyoInfo(x - 1, y)) {
                    // 左にぷよがある。右に1個ずれる必要がある
                    cx = 1;
                    // ずれる必要があるときに右にもぷよがあれば回転できない
                    if (Stage.getPuyoInfo(x + 1, y)) {
                        canRotate = false;
                    }
                }
            } else if (rotation === 180) {
                // 左から下：下・左下にぷよがあれば１個上に引き上げる
                // 下を確認
                if (Stage.getPuyoInfo(x, y +1)) {
                    // 下にぷよがある。引き上げる
                    cy = -1;
                }
                // 左下を確認
                if (Stage.getPuyoInfo(x -1, y + 1)) {
                    // 左下にぷよがある。引き上げる
                    cy = -1;
                }
            } else if (rotation === 270) {
                // 下から右：右にぷよがあれば左に移動させる必要がある
                // 右を確認
                if (Stage.getPuyoInfo(x + 1, y)) {
                    // 右にぷよがある。左に1個ずれる必要がある
                    cx = -1;
                    // ずれる必要があるときに左にぷよがあれば回転できない
                    if (Stage.getPuyoInfo(x - 1, y)) {
                        canRotate = false;
                    }
                }
            }

            if (canRotate) {
                // 上に移動する必要があるときは、一気に引き上げる
                if (cy === -1) {
                    if (Player.groundedFrame > 0) {
                        // 接地しているなら1段引き上げる
                        Player.playerPuyoStatus.y -= 1;
                        Player.groundedFrame = 0;
                    }
                    Player.playerPuyoStatus.top = Player.playerPuyoStatus.y * Config.puyoImageHeight;
                }
                // 回転できるので回転後の情報をセットして回転状態にする
                Player.actionStartFrame = frame;
                Player.rotateBeforeLeft = x * Config.puyoImageHeight;
                Player.rotateAfterLeft = (x + cx) * Config.puyoImageHeight;
                Player.rotateFromRotation = Player.playerPuyoStatus.rotation;
                // 次の状態を設定
                Player.playerPuyoStatus.x += cx;
                const nextRotation = (Player.playerPuyoStatus.rotation + 90) % 360;
                const dCombi = [[1, 0], [0, -1], [-1, 0], [0, 1]][nextRotation / 90];
                Player.playerPuyoStatus.dx = dCombi[0];
                Player.playerPuyoStatus.dy = dCombi[1];
                return 'rotating';
            }
        }
        return "playing";
    }
    
    // ぷよを左右に移動させる
    static movePlayerPuyo(frame) {
        // 左右の移動中も自由落下させる
        Player.dropPlayerPuyo(false);

        // 移動割合を計算
        let ratio = (frame - Player.actionStartFrame) / Config.playerMovingFrames;
        if (ratio > 1) {
            // 1を超えた場合は1にする
            ratio = 1;
        }
        Player.playerPuyoStatus.left = (Player.moveDestination - Player.moveSource) * ratio + Player.moveSource;
        // ぷよの表示位置を変化させる
        Player.setPlayerPuyoPosition();

        if (ratio === 1) {
            // アニメーションが終了していたらtrue
            return true;
        }
        return false;
    }

    // ぷよを回転させる
    static rotatePlayerPuyo(frame) {
        // 回転中も自由落下
        Player.dropPlayerPuyo(false);

        // 移動・回転割合を計算
        let ratio = (frame - Player.actionStartFrame) / Config.playerRotateFrames;
        if (ratio > 1) {
            // 1を超えた場合1にする
            ratio = 1;
        }
        Player.playerPuyoStatus.left = (Player.rotateAfterLeft - Player.rotateBeforeLeft) * ratio + Player.rotateBeforeLeft;
        Player.playerPuyoStatus.rotation = (Player.rotateFromRotation + ratio * 90) % 360;
        // ぷよの表示位置を変化
        Player.setPlayerPuyoPosition();

        if (ratio === 1) {
            // アニメーションが終了していたらtrue
            return true;
        }
        return false;
    }

    // 現在のプレイヤーが操作するぷよを盤上に配置
    static fixPlayerPuyo() {
        const {x, y, dx, dy} = Player.playerPuyoStatus;
        if (y >= 0) {
            // 中心ぷよが画面内にあった場合のみ配置
            Stage.createPuyo(x, y, Player.centerPuyoColor);
        }
        if (y + dy >= 0) {
            // 回転ぷよが画面内にあった場合のみ配置
            Stage.createPuyo(x + dx, y + dy, Player.rotatingPuyoColor);
        }
        // 操作用に作成したプレイヤーが操作するぷよを画面から消す
        Player.centerPuyoElement.remove();
        Player.centerPuyoElement = null;
        Player.rotatingPuyoElement.remove();
        Player.rotatingPuyoElement = null;
    }
}