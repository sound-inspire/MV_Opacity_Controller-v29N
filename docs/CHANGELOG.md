# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v29N (v14)] - 2025-10-22

### Added
- マーカー全削除ボタンを追加 (`選択ヘルパー`パネル内)
- タブUI実装(「メイン制御」「ツール」「ベイク」の3タブ)

### Removed
- ツールチップ表示機能を削除(UI簡素化のため)
- 関連する設定パネル(`showHelpCb`)を削除

### Changed
- UIを縦長から横長に最適化
- 機能の再分類によりアクセス性が向上

### Fixed
- なし(v29Mからの機能変更なし)

---

## [v29M] - 2025-XX-XX

### Added
- トグルロジック追加

### Changed
- エクスプレッション構築ロジックの改善

---

## [v13] - 2025-XX-XX

### Fixed
- `applyBtn.onClick`の`mode`判定ロジックをif/elseに修正

---

## [v10] - 2025-XX-XX

### Changed
- `buildExpression`でマーカー有無問わずフェード適用ロジックに変更

---

## [v5] - 2025-XX-XX

### Added
- レイヤーのイン/アウトに基づくフェード処理

---

## [Initial Release] - 2024-XX-XX

### Added
- 初回リリース
- BPM同期マーカー自動生成
- エクスプレッションによる不透明度制御
- プリセット機能
