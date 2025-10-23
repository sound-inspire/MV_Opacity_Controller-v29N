# MV_Opacity_Controller v29N

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![After Effects](https://img.shields.io/badge/After%20Effects-CC%202018%2B-blue.svg)](https://www.adobe.com/products/aftereffects.html)
[![Language](https://img.shields.io/badge/Language-JavaScript-orange.svg)](https://www.javascript.com/)

After Effectsでリリックビデオの点滅演出を自動化するスクリプトです。BPMに同期したマーカーを自動生成し、不透明度の制御をエクスプレッションで実現します。

---

## ✨ 主な機能

### 🎵 BPM同期マーカー自動生成
- 曲のBPMと拍子(4分、8分、16分など)を入力
- レイヤー上に自動でマーカーを配置
- 手動で何百ものキーフレームを打つ作業から解放

### 💫 2種類の点滅モード
- **ハード・フラッシュ**: 瞬時に0%と100%を切り替え(デジタル、鋭い印象)
- **ソフト・フラッシュ**: 滑らかに明滅(オーガニック、柔らかい印象)

### 🎮 手動マーカー制御
- `on`: 強制的に点滅をオン
- `off`: 強制的に点滅をオフ
- `hold`: 直前の状態を維持(余韻の演出)
- `fade:X`: X秒かけて徐々にフェード

### 🔄 マーカーコピー機能
- 基準レイヤーのマーカーを、複数レイヤーに一括コピー
- テキスト、図形、調整レイヤーを完璧に同期

### 🗑️ マーカー全削除機能 (v14新機能)
- 選択したレイヤーのマーカーを一括削除
- 作り直しが簡単に

### 🍞 ベイク機能
- エクスプレッションをキーフレームに変換
- Premiere Proなど他ソフトへの持ち出しに対応
- キーフレーム間引きでファイルサイズを最適化

---

## 🚀 クイックスタート

### 1. BPM同期マーカーを作成
1. 点滅させたいレイヤーを選択
2. 「ツール」タブを開く
3. BPM(例: 120)と拍子(例: 8分)を入力
4. 「BPMマーカー作成」ボタンをクリック

### 2. 点滅モードを設定
1. 「メイン制御」タブを開く
2. 「マーカー間にイーズを適用」チェックボックスで切り替え
   - チェックオフ = ハード・フラッシュ
   - チェックオン = ソフト・フラッシュ
3. 「最大不透明度(%)」で明るさを調整
4. 「エクスプレッションを適用」ボタンをクリック

### 3. 細かい調整
- タイムライン上の任意の時間で、`on`、`off`、`hold`、`fade:X`ボタンを使用
- BPM自動生成に、あなたの感性を加える

---

## 📚 詳しいドキュメント

- [インストール方法](docs/installation.md)
- [基本的な使い方](docs/basic-usage.md)
- [上級テクニック](docs/advanced-usage.md)
- [トラブルシューティング](docs/troubleshooting.md)

### 🎓 完全ガイド(有料)
プロの実践テクニック、シーン別設定値、トラブルシューティングなどを詳しく解説:

👉 **[『リリックビデオ「点滅演出」完全ガイド』(¥500)](記事リンク)**
- 理論から実践まで完全網羅
- 4つの点滅バリエーション
- BPM別推奨設定表
- コピペ可能なシーン別設定

👉 **[『MV_Opacity_Controller 完全活用ガイド』(¥200)](記事リンク)**
- 全タブ、全ボタンの詳細解説
- 時短テクニック3選
- エクスプレッションコード集

---

## 💻 動作環境

- **After Effects**: CC 2018以降
- **OS**: Windows / macOS

---

## 📥 インストール

### 方法1: 手動インストール
1. [Releases](https://github.com/sound-inspire/MV_Opacity_Controller-v29N/releases)から最新版をダウンロード
2. After Effectsの以下のフォルダに`MV_Opacity_Controller_v29N.jsx`を配置:
   - **Windows**: `C:\Program Files\Adobe\Adobe After Effects [version]\Support Files\Scripts\ScriptUI Panels\`
   - **macOS**: `/Applications/Adobe After Effects [version]/Scripts/ScriptUI Panels/`
3. After Effectsを再起動
4. `ウィンドウ` > `MV_Opacity_Controller_v29N.jsx`で起動

### 方法2: Git Clone
```bash
git clone https://github.com/sound-inspire/MV_Opacity_Controller-v29N.git
cd MV_Opacity_Controller-v29N
# スクリプトファイルを上記の手動インストールと同じ場所にコピー
```

---

## 🛠️ トラブルシューティング

### Q: マーカーがズレる
**A**: コンポジションのフレームレート(24fps推奨)とBPM計算を確認してください。

### Q: 点滅が速すぎる
**A**: 16分音符ではなく、8分または4分に変更してください。

### Q: エクスプレッション適用後、何も表示されない
**A**: マーカーが存在するか確認。最初のマーカーに`on`コメントを追加してください。

### Q: ベイク後、ファイルが重い
**A**: 「レート」を4fpsや8fpsに下げ、「キーフレームを間引く」をオンにしてください。

詳しくは [トラブルシューティングガイド](docs/troubleshooting.md) をご覧ください。

---

## 🤝 コントリビューション

バグ報告、機能リクエスト、プルリクエストを歓迎します!

### 開発に参加する
1. このリポジトリをFork
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにPush (`git push origin feature/AmazingFeature`)
5. Pull Requestを作成

詳しくは [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

---

## 📝 更新履歴

詳細は [CHANGELOG.md](CHANGELOG.md) をご覧ください。

### v29N (v14) (2025-10-22)
- ✨ タブUIを導入(「メイン制御」「ツール」「ベイク」)
- ✨ マーカー全削除ボタンを追加
- 🔧 ツールチップ機能を削除(UI簡素化)
- 🎨 UIの縦長問題を解決

### v29M (以前のバージョン)
- トグルロジック追加
- その他の機能改善

---

## 📜 ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。

---

## 👤 作者

**soundinspire #9**

- GitHub: [@sound-inspire](https://github.com/sound-inspire)
- Repository: [MV_Opacity_Controller-v29N](https://github.com/sound-inspire/MV_Opacity_Controller-v29N)

---

## 🌟 サポート

このスクリプトが役に立ったら、GitHubでスターをつけていただけると嬉しいです! ⭐

有料ガイドの購入や、投げ銭でのサポートも大歓迎です:
- 💰 [完全ガイド(¥300)](記事リンク)
- 💰 [活用ガイド(¥200)](記事リンク)

---

## 📧 お問い合わせ

- **Issues**: [GitHub Issues](https://github.com/sound-inspire/MV_Opacity_Controller-v29N/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sound-inspire/MV_Opacity_Controller-v29N/discussions)

---

**最終更新**: 2025-10-22
