// 起動されたときに呼ばれる関数を登録する
window.addEventListener("load", () => {
    // まずステージを整える
    initialize();

    // ゲームループを開始する
    gameLoop();
});

let gameState;
let frame;
let comboCount = 0;

function initialize() {
    // 画像を準備する
    GameImage.initialize();

    // ステージを準備する
    Stage.initialize();

    // プレイヤー操作を準備
    Player.initialize();

    // スコア表示を準備
    Score.initialize();

    // シーンを初期状態にセットする
    gameState = 'start';
    // フレームを初期化する
    frame = 0;
}
function gameLoop() {
    switch(gameState) {
        case 'start':
            // ゲーム開始時の状態
            // 最初は空中にあるかもし知れないぷよを自由落下
            gameState = 'checkFallingPuyo';
            break;
        case 'checkFallingPuyo':
            // 落ちるかどうか判定する状態
            if (Stage.checkFallingPuyo()) {
                gameState = 'fallingPuyo';
            }else{
                gameState = 'checkPuyoErase';
            }
            break;
        case 'fallingPuyo':
            // 自由落下状態
            if (!Stage.fallPuyo()) {
                gameState = 'checkPuyoErase';
            }
            break;
        case 'checkPuyoErase':
            // 消せるかどうか判定する状態
            const eraseInfo = Stage.checkPuyoErase(frame);
            if (eraseInfo) {
                gameState = 'erasingPuyo';
                comboCount++;
                // スコアを加算
                Score.addComboScore(comboCount, eraseInfo.piece, eraseInfo.color);
                Stage.hideZenkeshi();
            } else {
                if (Stage.puyoCount === 0 && comboCount > 0) {
                    // 全部消えたので、全消し表示
                    Stage.showZenkeshi();
                    // ボーナススコアを加算
                    Score.addScore(Config.zenkeshiBonus);
                }
                comboCount = 0;
                gameState = 'createPlayerPuyo';
            }
            break;
        case 'erasingPuyo':
            // ぷよが消えるアニメーション状態
            if (!Stage.erasePuyo(frame)) {
                // 消し終わったら、再度落ちるか判定
                gameState = 'checkFallingPuyo';
            }
            break;
        case 'createPlayerPuyo':
            // 新しくプレイヤーが操作するぷよを作成する状態
            if (!Player.createPlayerPuyo()) {
                // 新しく操作用ぷよを作成する。できなければゲームオーバー
                gameState = 'gameover';
            } else {
                // プレイヤーが操作する
                gameState = 'playing';
            }
            break;
        case 'playing':
            // プレイヤーが操作する状態
            const nextAction = Player.update(frame);
            gameState = nextAction; // 'playing' or 'fix' or 'moving' or 'rotating'
            break;
        case 'fix':
            // 現在の位置でぷよを固定する状態
            Player.fixPlayerPuyo();
            // 固定が完了したら、自由落下できるぷよがあるか確認する
            gameState = 'checkFallingPuyo';
            break;
        case 'moving':
            // プレイヤーが操作するぷよが左右に移動するアニメーション
            if (Player.movePlayerPuyo(frame)) {
                // 移動が終わったので操作可能にする
                gameState = 'playing';
            }
            break;
        case 'rotating':
            // 回転するアニメーション
            if (Player.rotatePlayerPuyo(frame)) {
                gameState = 'playing';
            }
            break;
    }
    frame++;
    setTimeout(gameLoop, 1000 / 60);
}