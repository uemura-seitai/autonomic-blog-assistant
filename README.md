# ブログ作成補助ツール

自律神経ブログを作る際に、ChatGPTへ送るプロンプト作成・回答整理・HTML完成を補助する無料の静的サイトです。API、サーバー処理、データベース、WordPress連携は使いません。GitHub Pagesで公開すれば、Macがなくてもスマホのブラウザだけで使えます。

## スマホだけで使う方法

1. GitHub PagesのURL（例：`https://ユーザー名.github.io/autonomic-blog-assistant/`）をスマホで開きます。
2. SafariまたはChromeで開きます。
3. 必要に応じてホーム画面に追加します。iPhoneのSafariでは共有ボタンから「ホーム画面に追加」、AndroidのChromeではメニューから「ホーム画面に追加」または「アプリをインストール」を選びます。
4. STEP1から順番にプロンプトをコピーし、ChatGPTの回答を各欄へ貼り付けます。
5. STEP6で画像URLを入力して完成HTMLを作成・コピーします。
6. WordPressへの投稿、画像のアップロード、完成HTMLの貼り付けは手動で行います。

### 保存について

入力内容は、そのスマホ端末のブラウザ内（localStorage）に自動保存されます。サーバーには送信されません。

- 別の端末・別のブラウザとは自動同期されません。
- ブラウザの履歴やサイトデータを消去すると、保存内容も消えます。
- Macで保存した内容とスマホで保存した内容は別です。

## GitHub Pagesで公開する手順

1. GitHubにログインし、新しいリポジトリを作成します。公開URLを分かりやすくするには、リポジトリ名を `autonomic-blog-assistant` にします。
2. このフォルダ内のファイルをリポジトリへアップロード（またはGitでpush）します。
3. GitHubのリポジトリ画面で **Settings** を開きます。
4. 左側の **Pages** を開きます。
5. **Build and deployment** の Source を **Deploy from a branch** にします。
6. Branch に **main**、フォルダに **/(root)** を選びます。
7. **Save** を押します。
8. 数分待つと表示されるURLをスマホで開きます。リポジトリ名が `autonomic-blog-assistant` の場合、URLは通常 `https://ユーザー名.github.io/autonomic-blog-assistant/` です。

公開後に変更を反映するには、更新したファイルを同じ `main` ブランチへアップロードまたはpushします。GitHub Pagesが再公開されるまで数分かかることがあります。

## ファイル

- `index.html`：画面構造とPWA設定の読み込み
- `style.css`：スマホ優先の見た目
- `script.js`：プロンプト生成、コピー、端末内保存、画像挿入、HTML出力
- `manifest.json`：ホーム画面追加時のアプリ名・色・アイコン設定
- `icon.svg`：仮のシンプルなアプリアイコン
- `service-worker.js`：一度開いた画面をオフラインでも再表示するためのキャッシュ
