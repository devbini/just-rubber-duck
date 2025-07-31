import * as vscode from "vscode";

let installUri: vscode.Uri;

export function activate(context: vscode.ExtensionContext) {
  installUri = context.extensionUri;

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

  //#region [Command 등록]
  const openDuckCommand = vscode.commands.registerCommand(
    "extension.openRubberDuckView", async () => await vscode.commands.executeCommand("rubberduck_view.focus")    
  );
  context.subscriptions.push(openDuckCommand);

  const stopDuckAnimation = vscode.commands.registerCommand(
    "extension.stopDuckAnimation", () => duckProvider.setAnimation(false)    
  );
  context.subscriptions.push(stopDuckAnimation);

  const startDuckAnimation = vscode.commands.registerCommand(
    "extension.startDuckAnimation", () => duckProvider.setAnimation(true)
  );
  context.subscriptions.push(startDuckAnimation);

  const duckSpeedSlow = vscode.commands.registerCommand(
    "extension.duckSpeedSlow", () => duckProvider.setAnimationDuration(2)
  );
  context.subscriptions.push(duckSpeedSlow);

  const duckSpeedNormal = vscode.commands.registerCommand(
    "extension.duckSpeedNormal", () => duckProvider.setAnimationDuration(1)
  );
  context.subscriptions.push(duckSpeedNormal);

  const duckSpeedFast = vscode.commands.registerCommand(
    "extension.duckSpeedFast", () => duckProvider.setAnimationDuration(0.5)
  );
  context.subscriptions.push(duckSpeedFast);

  const duckSpeedHighFast = vscode.commands.registerCommand(
    "extension.duckSpeedHighFast", () => duckProvider.setAnimationDuration(0.1)
  );
  context.subscriptions.push(duckSpeedHighFast);

  //#endregion
}

export function deactivate() { }

class RubberDuckProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "rubberduck_view";
  private webviewView?: vscode.WebviewView;
  private animate: boolean = true;
  private animationDuration: number = 1;

  constructor(private backgroundColor: string) { }

  // 러버덕 움직임 여부
  public setAnimation(enabled: boolean) {
    this.animate = enabled;
    this.refresh();
  }

  // 러버덕 움직임 속도 조절
  public setAnimationDuration(duration: number) {
    this.animationDuration = duration;
    this.refresh();
  }

  private refresh() {
    if (this.webviewView) {
      const duckImagePath = vscode.Uri.joinPath(
        installUri,
        "resource",
        "rubberduck.png"
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
                  ${this.animate ? `animation: waddle ${this.animationDuration}s infinite ease-in-out;` : ''}
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
