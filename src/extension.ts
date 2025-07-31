import * as vscode from "vscode";

let installUri: vscode.Uri;

export function activate(context: vscode.ExtensionContext) {
  installUri = context.extensionUri;

  const duckImages = [
    "rubberduck.png",
    "rubberduck-cowboy.png",
    "rubberduck-hoodie.png",
    "rubberduck-suit.png",
    "rubberduck-police.png"
  ];

  // 테마별 배경 색 설정 (Sync vscode Theme)
  const activeTheme = vscode.window.activeColorTheme;
  let bgColor = "#1e1e1e";
  if (activeTheme.kind === vscode.ColorThemeKind.Light) {
    bgColor = "#ffffff";
  } else if (activeTheme.kind === vscode.ColorThemeKind.HighContrast) {
    bgColor = "#000000";
  }

  const duckProvider = new RubberDuckProvider(bgColor);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      RubberDuckProvider.viewType,
      duckProvider
    )
  );

  // 커맨드 등록
  const openDuckCommand = vscode.commands.registerCommand(
    "extension.openRubberDuckView", async () => await vscode.commands.executeCommand("rubberduck_view.focus")
  );
  context.subscriptions.push(openDuckCommand);

  const setDuck = vscode.commands.registerCommand(
    "extension.setDuck3D", () => duckProvider.changeDuckImage("rubberduck.png")
  );
  context.subscriptions.push(setDuck);

  const setDuckCowboy = vscode.commands.registerCommand(
    "extension.setDuckCowboy", () => duckProvider.changeDuckImage("rubberduck-cowboy.png")
  );
  context.subscriptions.push(setDuckCowboy);

  const setDuckHoodie = vscode.commands.registerCommand(
    "extension.setDuckHoodie", () => duckProvider.changeDuckImage("rubberduck-hoodie.png")
  );
  context.subscriptions.push(setDuckHoodie);

  const setDuckMen = vscode.commands.registerCommand(
    "extension.setDuckMen", () => duckProvider.changeDuckImage("rubberduck-suit.png")
  );
  context.subscriptions.push(setDuckMen);

  const setDuckPolice = vscode.commands.registerCommand(
    "extension.setDuckPolice", () => duckProvider.changeDuckImage("rubberduck-police.png")
  );
  context.subscriptions.push(setDuckPolice);

  const changeDuckImageCommand = vscode.commands.registerCommand(
    "extension.setDuckRandom", () => duckProvider.changeDuckImage(duckImages[Math.floor(Math.random() * duckImages.length)])
  );
  context.subscriptions.push(changeDuckImageCommand);
}

export function deactivate() { }

class RubberDuckProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "rubberduck_view";
  private webviewView?: vscode.WebviewView;
  private currentImage: string;

  constructor(private backgroundColor: string) {
    this.currentImage = "rubberduck.png";
  }

  public changeDuckImage(imageFileName: string) {
    this.currentImage = imageFileName;
    if (this.webviewView) {
      const duckImagePath = vscode.Uri.joinPath(
        installUri,
        "resource",
        this.currentImage
      );
      const duckImageUri = this.webviewView.webview.asWebviewUri(duckImagePath);
      this.webviewView.webview.html = this.generateHTML(duckImageUri, this.backgroundColor);
    }
  }

  public resolveWebviewView(
    view: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.webviewView = view;
    view.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(installUri, "resource")],
    };

    const duckImagePath = vscode.Uri.joinPath(
      installUri,
      "resource",
      "rubberduck.png"
    );
    const duckImageUri = view.webview.asWebviewUri(duckImagePath);

    view.webview.html = this.generateHTML(duckImageUri, this.backgroundColor);
  }

  private generateHTML(duckUri: vscode.Uri, bgColor: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Security-Policy"
                content="default-src 'none'; img-src ${duckUri.scheme}://*; style-src 'unsafe-inline'; script-src 'none';">
          <style>
              html, body {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  height: 100%;
                  background-color: ${bgColor};
                  display: flex;
                  justify-content: center;
                  align-items: center;
              }
              img {
                  max-width: 90%;
                  max-height: 90%;
                  animation: waddle 1s infinite ease-in-out;
                  transform-origin: bottom center;
              }
              @keyframes waddle {
                  0%   { transform: rotate(0deg); }
                  25%  { transform: rotate(-2deg); }
                  50%  { transform: rotate(0deg); }
                  75%  { transform: rotate(2deg); }
                  100% { transform: rotate(0deg); }
              }
          </style>
      </head>
      <body>
          <img src="${duckUri}" alt="Rubber Duck">
      </body>
      </html>
    `;
  }
}
