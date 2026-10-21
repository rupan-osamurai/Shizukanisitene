let audioContext;
let analyser;
let microphone;
let javascriptNode;
let isPlaying = false;
let timer;
let timeLeft = 10;
let currentThreshold = 30;
 
// レベル別の設定（睡眠時・起きちゃった時の高画質写真URL）
const levelData = {
  1: {
    title: "レベル1: 地位革風すやすや生き物",
    sleepImg: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80",
    awakeImg: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80",
    overMsg: "<h3 style='color:#ff8b94;'>😭 起きて泣き出しちゃった！GAME OVER</h3>",
    clearMsg: "<h3 style='color:#a8e6cf;'>✨ すやすや守り抜いた！CLEAR!</h3>"
  },
  2: {
    title: "レベル2: ポケモン風モンスター",
    sleepImg: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
    awakeImg: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80",
    overMsg: "<h3 style='color:#ff8b94;'>⚡ 驚いて威嚇してきた！GAME OVER</h3>",
    clearMsg: "<h3 style='color:#a8e6cf;'>🌟 ぐっすり眠れている！CLEAR!</h3>"
  },
  3: {
    title: "レベル3: 激シブ男塾風ヤンキー",
    sleepImg: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    awakeImg: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    overMsg: "<h3 style='color:#ff6b6b;'>🔥「貴様ァ！ワシの睡眠を妨げる気かぁーっ！！」GAME OVER</h3>",
    clearMsg: "<h3 style='color:#a8e6cf;'>👊 男の静寂を守り切った！完璧なる漢！CLEAR!</h3>"
  }
};
 
let currentLevel = 1;
 
// 閾値スライダー監視
const thresholdInput = document.getElementById("threshold");
const thresholdVal = document.getElementById("threshold-val");
thresholdInput.addEventListener("input", (e) => {
  currentThreshold = parseInt(e.target.value);
  thresholdVal.textContent = currentThreshold;
});
 
// マイク初期化
async function initMic() {
  if (audioContext) return;
 
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  microphone = audioContext.createMediaStreamSource(stream);
  javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
 
  analyser.smoothingTimeConstant = 0.8;
  analyser.fftSize = 1024;
 
  microphone.connect(analyser);
  analyser.connect(javascriptNode);
  javascriptNode.connect(audioContext.destination);
 
  javascriptNode.onaudioprocess = () => {
    if (!isPlaying) return;
 
    const array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    let values = 0;
    for (let i = 0; i < array.length; i++) {
      values += array[i];
    }
    const average = values / array.length;
    document.getElementById("volume-meter").value = average;
 
    // 規定音量を超えたらゲームオーバー
    if (average > currentThreshold) {
      gameOver();
    }
  };
}
 
// ゲームスタート
async function startGame(level) {
  currentLevel = level;
  try {
    await initMic();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
  } catch (err) {
    alert("マイクの使用許可が必要です。ブラウザの設定でマイクを許可してください。");
    return;
  }
 
  isPlaying = true;
  timeLeft = 10;
 
  const data = levelData[level];
  document.getElementById("level-title").textContent = data.title;
  
  const charImg = document.getElementById("char-img");
  charImg.src = data.sleepImg;
  charImg.classList.remove("shake");
 
  document.getElementById("status-message").innerHTML = "";
  document.getElementById("retry-btn").classList.add("hidden");
  document.getElementById("level-select-area").classList.add("hidden");
  document.getElementById("game-area").classList.remove("hidden");
  document.getElementById("time-left").textContent = timeLeft;
 
  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("time-left").textContent = timeLeft;
    if (timeLeft <= 0) {
      gameClear();
    }
  }, 1000);
}
 
// ゲームオーバー処理
function gameOver() {
  isPlaying = false;
  clearInterval(timer);
 
  const data = levelData[currentLevel];
  const charImg = document.getElementById("char-img");
  
  charImg.src = data.awakeImg;
  charImg.classList.add("shake"); // 画像を揺らして激怒演出
 
  document.getElementById("status-message").innerHTML = data.overMsg;
  document.getElementById("retry-btn").classList.remove("hidden");
}
 
// クリア処理
function gameClear() {
  isPlaying = false;
  clearInterval(timer);
 
  const data = levelData[currentLevel];
  document.getElementById("status-message").innerHTML = data.clearMsg;
  document.getElementById("retry-btn").classList.remove("hidden");
}
 
// レベル選択画面に戻る
function resetGame() {
  document.getElementById("game-area").classList.add("hidden");
  document.getElementById("level-select-area").classList.remove("hidden");
  document.getElementById("volume-meter").value = 0;
}
