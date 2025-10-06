// モックデータ (実際のアプリケーションではバックエンドから取得します)
const mockUserInfo = [
    { id: 'user123', first_name: '田中', last_name: '太郎', manager_id: 'manager456' },
    { id: 'manager456', first_name: '鈴木', last_name: '一郎', manager_id: null }, // マネージャー
    { id: 'user789', first_name: '佐藤', last_name: '花子', manager_id: 'manager456' }
];

const mockWorkflows = [
    { id: 'wf1_attendance', frow_name: '勤怠連絡' },
    { id: 'wf2_purchase', frow_name: '定期購入' },
    { id: 'wf3_certificate', frow_name: '資格申請' },
    { id: 'wf4_dependent', frow_name: '扶養届け' },
    { id: 'wf5_month_end', frow_name: '月末処理' },
    { id: 'wf6_address_change', frow_name: '住所変更' }
];

// DOM要素の取得
const appContainer = document.getElementById('app-container');
const messageBox = document.getElementById('message-box');

// Global Modal DOM elements
const globalConfirmationModal = document.getElementById('globalConfirmationModal');
const globalConfirmContent = document.getElementById('globalConfirmContent');
const globalCancelConfirmButton = document.getElementById('globalCancelConfirmButton');
const globalConfirmSubmitButton = document.getElementById('globalConfirmSubmitButton');

const globalMessageModal = document.getElementById('globalMessageModal');
const globalMessageTitle = document.getElementById('globalMessageTitle');
const globalMessageContent = document.getElementById('globalMessageContent');
const globalCloseMessageModalButton = document.getElementById('globalCloseMessageModalButton');

// Variables to store modal callbacks
let currentOnConfirmCallback = null;
let currentOnCancelCallback = null;
let currentOnMessageCloseCallback = null;
let currentFormId = ''; // 現在のフォームのIDを保持

/**
 * カスタムメッセージボックスを表示する関数 (ページ上部に表示される一時的なメッセージ)
 * @param {string} message - 表示するメッセージ
 * @param {string} type - 'success' または 'error'
 */
function showMessage(message, type) {
    messageBox.textContent = message;
    messageBox.className = 'message-box show'; // 基本スタイルと表示状態を適用

    // タイプに応じたスタイルを適用
    if (type === 'error') {
        messageBox.classList.add('error');
    } else {
        messageBox.classList.remove('error');
    }

    // 3秒後にメッセージボックスを非表示にする
    setTimeout(() => {
        messageBox.classList.remove('show');
        // 非表示になった後にクラスをリセット（特にエラークラス）
        setTimeout(() => {
            messageBox.className = 'message-box';
        }, 300); // transitionの時間と合わせる
    }, 3000);
}

/**
 * 共通の確認モーダルを表示する関数
 * @param {string} title - モーダルのタイトル
 * @param {string} contentHtml - モーダルに表示するHTMLコンテンツ
 * @param {Function} onConfirm - 「送信」ボタンがクリックされたときに実行されるコールバック
 * @param {Function} onCancel - 「修正」ボタンがクリックされたときに実行されるコールバック
 */
function openConfirmationModal(title, contentHtml, onConfirm, onCancel) {
    globalConfirmationModal.querySelector('h2').textContent = title;
    globalConfirmContent.innerHTML = contentHtml;
    currentOnConfirmCallback = onConfirm;
    currentOnCancelCallback = onCancel;
    globalConfirmationModal.classList.remove('hidden');
}

/**
 * 共通の確認モーダルを閉じる関数
 */
function closeConfirmationModal() {
    globalConfirmationModal.classList.add('hidden');
    currentOnConfirmCallback = null;
    currentOnCancelCallback = null;
}

// 「修正」ボタンのイベントリスナー
globalCancelConfirmButton.addEventListener('click', () => {
    if (currentOnCancelCallback) {
        currentOnCancelCallback();
    }
    closeConfirmationModal();
});

// 「送信」ボタンのイベントリスナー
globalConfirmSubmitButton.addEventListener('click', () => {
    if (currentOnConfirmCallback) {
        currentOnConfirmCallback();
    }
    closeConfirmationModal(); // 送信後は確認モーダルを閉じる
});

/**
 * 共通のメッセージモーダルを表示する関数
 * @param {string} title - モーダルのタイトル
 * @param {string} contentHtml - モーダルに表示するHTMLコンテンツ
 * @param {Function} onClose - 「閉じる」ボタンがクリックされたときに実行されるコールバック
 * @param {boolean} isError - エラーメッセージかどうか (trueなら赤色表示)
 */
function openMessageModal(title, contentHtml, onClose, isError = false) {
    globalMessageTitle.textContent = title;
    globalMessageContent.innerHTML = contentHtml;
    currentOnMessageCloseCallback = onClose;

    if (isError) {
        globalMessageTitle.classList.add('text-red-600');
        globalMessageTitle.classList.remove('text-gray-800');
    } else {
        globalMessageTitle.classList.remove('text-red-600');
        globalMessageTitle.classList.add('text-gray-800');
    }

    globalMessageModal.classList.remove('hidden');
}

/**
 * 共通のメッセージモーダルを閉じる関数
 */
function closeMessageModal() {
    globalMessageModal.classList.add('hidden');
    if (currentOnMessageCloseCallback) {
        currentOnMessageCloseCallback();
    }
    currentOnMessageCloseCallback = null;
}

// メッセージモーダルの「閉じる」ボタンのイベントリスナー
globalCloseMessageModalButton.addEventListener('click', closeMessageModal);


/**
 * ログイン画面をレンダリングする関数
 */
function renderLoginScreen() {
    // app-containerのスタイルをログイン画面用に調整
    appContainer.classList.add('max-w-lg'); // ログイン画面の最大幅を適用
    appContainer.classList.add('p-8'); // ログイン画面のパディングを適用
    appContainer.classList.remove('max-w-screen-lg'); // ワークフロー画面の幅を解除
    appContainer.classList.remove('p-6'); // ワークフロー画面のパディングを解除

    appContainer.innerHTML = `
        <div class="login-content">
            <h2 class="text-3xl font-bold text-center mb-8 text-gray-800">システムログイン</h2>

            <div id="errorMessage" class="text-red-600 text-center mb-6 font-medium">
                </div>

            <form id="loginForm" class="space-y-6" novalidate>
                <div>
                    <label for="loginId" class="block text-sm font-medium text-gray-700 mb-1">ログインID</label>
                    <input
                        type="text"
                        id="loginId"
                        name="loginId"
                        minlength="10"
                        maxlength="50"
                        placeholder="ログインIDを入力してください"
                        required
                        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 text-base focus:outline-none transition duration-150 ease-in-out"
                    >
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        minlength="8"
                        maxlength="16"
                        placeholder="パスワードを入力してください"
                        required
                        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500 text-base focus:outline-none transition duration-150 ease-in-out"
                    >
                </div>

                <div>
                    <button
                        type="submit"
                        id="loginButton"
                        class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:scale-95"
                    >
                        ログイン
                    </button>
                </div>
            </form>
        </div>
    `;

    const loginForm = document.getElementById('loginForm');
    const loginIdInput = document.getElementById('loginId');
    const passwordInput = document.getElementById('password');
    const errorMessageDiv = document.getElementById('errorMessage');

    // ログイン処理のシミュレーション
    const validLoginId = 'jqit@gmail.com';
    const validPassword = 'password';

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); // フォームのデフォルト送信を防止

        errorMessageDiv.textContent = ''; // エラーメッセージをクリア

        const loginId = loginIdInput.value.trim();
        const password = passwordInput.value.trim();

        // ログインIDとパスワードの有効性をチェック
        const isLoginIdValid = loginId === validLoginId;
        const isPasswordValid = password === validPassword;
        const isLoginIdEmpty = loginId === '';
        const isPasswordEmpty = password === '';

        let errorMessage = '';

        if (isLoginIdEmpty && isPasswordEmpty) {
            errorMessage = 'ログインIDとパスワードを入力してください。';
        } else if (isLoginIdEmpty) {
            errorMessage = 'ログインIDが入力されていません。ログインIDを入力してください。';
        } else if (isPasswordEmpty) {
            errorMessage = 'パスワードが入力されていません。パスワードを入力してください。';
        } else if (isLoginIdValid && !isPasswordValid) {
            errorMessage = 'パスワードが無効です。';
        } else if (!isLoginIdValid && isPasswordValid) {
            errorMessage = 'ログインIDが無効です。有効なログインIDを入力してください。';
        } else if (!isLoginIdValid && !isPasswordValid) {
            errorMessage = 'ログインIDとパスワードの両方が無効です。';
        }

        // エラーメッセージの表示またはログイン成功処理
        if (errorMessage) {
            errorMessageDiv.textContent = errorMessage;
        } else {
            // 両方有効な場合
            sessionStorage.setItem('isLoggedIn', 'true');
            renderWorkflowScreen();
        }
    });
}

/**
 * ワークフロー画面をレンダリングする関数
 */
function renderWorkflowScreen() {
    // app-containerのスタイルをワークフロー画面用に調整
    appContainer.classList.remove('max-w-lg'); // ログイン画面の最大幅を解除
    appContainer.classList.remove('p-8'); // ログイン画面のパディングを解除
    appContainer.classList.add('max-w-screen-lg'); // ワークフロー画面の幅を適用 (lg: 1024px)
    appContainer.classList.add('p-6'); // ワークフロー画面のパディングを適用

    appContainer.innerHTML = `
        <div class="workflow-content space-y-6">
            <h1 class="text-3xl font-bold text-gray-800 text-center">ワークフロー申請</h1>

            <header class="header-bg p-4 rounded-lg flex flex-col sm:flex-row sm:justify-between items-center sm:space-x-8 shadow-md">
                <div class="flex flex-col sm:flex-row sm:space-x-8 w-full sm:w-auto mb-4 sm:mb-0">
                    <div class="mb-2 sm:mb-0">
                        <label for="userName" class="block text-sm font-medium text-gray-700">ユーザー名</label>
                        <div id="userName" class="label mt-1 text-base text-gray-900 font-semibold rounded-md bg-gray-100 px-3 py-2 w-full sm:w-64 border border-gray-300">
                            ユーザー一覧表：ユーザー名
                        </div>
                    </div>
                    <div>
                        <label for="managerName" class="block text-sm font-medium text-gray-700">管理営業名</label>
                        <div id="managerName" class="label mt-1 text-base text-gray-900 font-semibold rounded-md bg-gray-100 px-3 py-2 w-full sm:w-64 border border-gray-300">
                            管理営業一覧表：管理営業名
                        </div>
                    </div>
                </div>
                <div class="w-full sm:w-auto flex justify-end mt-4 sm:mt-0">
                    <button id="logoutButton" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-md shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75">
                        ログアウト
                    </button>
                </div>
            </header>

            <section class="bg-white p-6 rounded-lg shadow-md">
                <label for="workflowType" class="block text-sm font-medium text-gray-700 mb-2">ワークフロータイプ <span class="text-red-500">*</span></label>
                <select id="workflowType" class="mt-1 block w-full sm:w-1/2 lg:w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm">
                    <option value="">選択してください</option>
                    </select>
            </section>

            <section id="dynamicWorkflowArea" class="dynamic-area-bg p-6 rounded-lg border-2 border-dashed border-gray-300 text-center text-gray-600 text-base shadow-md">
                <p class="font-bold text-lg mb-4">ここより下はワークフローの種類により変動する</p>
                <div id="dynamicContent" class="text-gray-800 text-xl font-medium">
                    ワークフロータイプが選択されていません。
                </div>
            </section>
        </div>
    `;

    // ワークフロー画面のDOM要素を取得
    const userNameElement = document.getElementById('userName');
    const managerNameElement = document.getElementById('managerName');
    const logoutButton = document.getElementById('logoutButton');
    const workflowTypeSelect = document.getElementById('workflowType');
    const dynamicWorkflowArea = document.getElementById('dynamicWorkflowArea');
    const dynamicContentElement = document.getElementById('dynamicContent');


    // 1. ユーザー名と管理営業名の表示
    try {
        const loggedInUserId = 'user123'; // 例として 'user123' をログインユーザーとする

        const currentUser = mockUserInfo.find(user => user.id === loggedInUserId);

        if (currentUser) {
            userNameElement.textContent = `${currentUser.first_name} ${currentUser.last_name}`;

            if (currentUser.manager_id) {
                const manager = mockUserInfo.find(user => user.id === currentUser.manager_id);
                if (manager) {
                    managerNameElement.textContent = `${manager.first_name} ${manager.last_name}`;
                } else {
                    managerNameElement.textContent = '管理営業情報が見つかりません';
                    console.warn(`Manager with ID ${currentUser.manager_id} not found.`);
                }
            } else {
                managerNameElement.textContent = '担当管理営業はいません';
            }
        } else {
            userNameElement.textContent = 'ログインユーザー情報が見つかりません';
            managerNameElement.textContent = '管理営業情報が見つかりません';
            console.error(`Logged in user with ID ${loggedInUserId} not found.`);
        }
    } catch (error) {
        console.error('ユーザー名または管理営業名の表示中にエラーが発生しました:', error);
        userNameElement.textContent = '情報の読み込みに失敗しました';
        managerNameElement.textContent = '情報の読み込みに失敗しました';
    }

    // 2. ログアウトボタンの機能 (ログイン画面に戻る)
    logoutButton.addEventListener('click', () => {
        if (confirm('ログアウトしますか？')) {
            sessionStorage.removeItem('isLoggedIn');
            renderLoginScreen();
        }
    });

    // 3. ワークフロータイププルダウンの選択肢設定
    try {
        mockWorkflows.forEach(workflow => {
            const option = document.createElement('option');
            option.value = workflow.id; // 値は内部的なID
            option.textContent = workflow.frow_name; // 表示名は日本語名
            workflowTypeSelect.appendChild(option);
        });
    } catch (error) {
        console.error('ワークフロータイプのプルダウン設定中にエラーが発生しました:', error);
        const errorOption = document.createElement('option');
        errorOption.value = "";
        errorOption.textContent = "読み込みエラー";
        errorOption.disabled = true;
        workflowTypeSelect.appendChild(errorOption);
    }

    // 4. ワークフローの種類により変動する領域の更新
    workflowTypeSelect.addEventListener('change', (event) => {
        const selectedValue = event.target.value;
        dynamicWorkflowArea.innerHTML = ''; // クリア existing content

        if (selectedValue === "") {
            dynamicWorkflowArea.innerHTML = `
                <p class="font-bold text-lg mb-4">ここより下はワークフローの種類により変動する</p>
                <div id="dynamicContent" class="text-gray-800 text-xl font-medium">
                    ワークフロータイプが選択されていません。
                </div>
            `;
        } else {
            const selectedWorkflow = mockWorkflows.find(wf => wf.id === selectedValue);
            if (selectedWorkflow) {
                loadWorkflowContent(selectedWorkflow.id);
            } else {
                dynamicWorkflowArea.innerHTML = `
                    <p class="font-bold text-lg mb-4">ここより下はワークフローの種類により変動する</p>
                    <div id="dynamicContent" class="text-red-500 text-xl font-medium">
                        選択されたワークフローが見つかりません。
                    </div>
                `;
            }
        }
    });
}

/**
 * ワークフローコンテンツを動的にロードする関数
 */
function loadWorkflowContent(workflowId) {
    const dynamicWorkflowArea = document.getElementById('dynamicWorkflowArea');
    let contentHtml = '';
    // 各ワークフローIDに基づいて適切なHTMLコンテンツを挿入
    switch (workflowId) {
        case 'wf1_attendance':
            contentHtml = `
                <div class="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">勤怠連絡</h1>

                    <form id="attendanceForm" class="space-y-6">
                        <div class="form-group">
                            <label for="contactDate" class="block text-sm font-medium text-gray-700 mb-1">
                                日付 <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <input type="text" id="contactDate" name="contactDate"
                                       class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm attendance-date-picker"
                                       placeholder="YYYY/MM/DD" required>
                            </div>
                            <p id="contactDateError" class="error-message hidden"></p>
                        </div>

                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                事由（勤怠内容） <span class="text-red-500">*</span>
                            </label>
                            <div class="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                                <label class="inline-flex items-center">
                                    <input type="radio" name="reasonType" value="0" class="form-radio text-blue-600 rounded-full" checked>
                                    <span class="ml-2 text-gray-700">0: 有給</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="reasonType" value="1" class="form-radio text-blue-600 rounded-full">
                                    <span class="ml-2 text-gray-700">1: 代休</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="reasonType" value="2" class="form-radio text-blue-600 rounded-full">
                                    <span class="ml-2 text-gray-700">2: 欠勤</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="reasonType" value="3" class="form-radio text-blue-600 rounded-full">
                                    <span class="ml-2 text-gray-700">3: 遅刻</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="reasonType" value="4" class="form-radio text-blue-600 rounded-full">
                                    <span class="ml-2 text-gray-700">4: 早退</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="reasonType" value="5" class="form-radio text-blue-600 rounded-full">
                                    <span class="ml-2 text-gray-700">5: 中抜け</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="reasonType" value="6" class="form-radio text-blue-600 rounded-full">
                                    <span class="ml-2 text-gray-700">6: 忌引き</span>
                                </label>
                            </div>
                        </div>

                        <div id="lateTimeSection" class="hidden form-group">
                            <label for="lateTime" class="block text-sm font-medium text-gray-700 mb-1">
                                遅刻時間 <span class="text-red-500">*</span>
                            </label>
                            <select id="lateTime" name="lateTime"
                                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                </select>
                            <p id="lateTimeError" class="error-message hidden"></p>
                        </div>

                        <div id="earlyLeaveTimeSection" class="hidden form-group">
                            <label for="earlyLeaveTime" class="block text-sm font-medium text-gray-700 mb-1">
                                早退時間 (HH:mm) <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="earlyLeaveTime" name="earlyLeaveTime" minlength="5" maxlength="5"
                                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                   placeholder="例: 17:30">
                            <p id="earlyLeaveTimeError" class="error-message hidden"></p>
                        </div>

                        <div id="middleLeaveTimeSection" class="hidden form-group">
                            <label for="middleLeaveTime" class="block text-sm font-medium text-gray-700 mb-1">
                                中抜け時間 <span class="text-red-500">*</span>
                            </label>
                            <select id="middleLeaveTime" name="middleLeaveTime" minlength="1" maxlength="256"
                                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            </select>
                            <p id="middleLeaveTimeError" class="error-message hidden"></p>
                        </div>

                        <div id="substituteDateSection" class="hidden form-group">
                            <label for="substituteDate" class="block text-sm font-medium text-gray-700 mb-1">
                                代休消化日 <span class="text-red-500">*</span>
                            </label>
                            <div class="relative">
                                <input type="text" id="substituteDate" name="substituteDate"
                                       class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm attendance-date-picker"
                                       placeholder="YYYY/MM/DD">
                            </div>
                            <p id="substituteDateError" class="error-message hidden"></p>
                        </div>

                        <div class="form-group">
                            <label for="reason" class="block text-sm font-medium text-gray-700 mb-1">
                                理由 <span class="text-red-500">*</span>
                            </label>
                            <textarea id="reason" name="reason" rows="4" maxlength="256"
                                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                      placeholder="勤怠連絡の理由を入力してください（最大256文字）"></textarea>
                            <p id="reasonError" class="error-message hidden"></p>
                        </div>

                        <div class="flex justify-center mt-6">
                            <button type="button" id="submitButton_attendance"
                                    class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 ease-in-out">
                                送信確認
                            </button>
                        </div>
                    </form>
                </div>
            `;
            break;
        case 'wf2_purchase':
            contentHtml = `
                <div class="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">定期購入</h1>
                    <form id="subscription-form" class="space-y-6">
                        <div class="p-4 border border-gray-300 rounded-lg space-y-4">
                            <h3 class="text-lg font-semibold text-gray-700">主経路</h3>
                            <div class="form-group">
                                <label for="purchaseDate" class="font-medium text-gray-700">定期購入日 <span class="text-red-500">*</span></label>
                                <input type="text" id="purchaseDate" name="purchaseDate" class="w-full mt-1 purchase-date-picker" placeholder="YYYY/MM/DD">
                                <p class="error-message hidden" id="purchaseDateError"></p>
                            </div>
                            <div class="form-group">
                                <label for="nearestStation" class="font-medium text-gray-700">最寄駅 <span class="text-red-500">*</span></label>
                                <input type="text" id="nearestStation" name="nearestStation" class="w-full mt-1" placeholder="例: 新宿" minlength="1" maxlength="20" autocomplete="off">
                                <p class="error-message hidden" id="nearestStationError"></p>
                            </div>
                            <div class="form-group">
                                <label for="destinationStation" class="font-medium text-gray-700">目的駅 <span class="text-red-500">*</span></label>
                                <input type="text" id="destinationStation" name="destinationStation" class="w-full mt-1" placeholder="例: 東京" minlength="1" maxlength="20" autocomplete="off">
                                <p class="error-message hidden" id="destinationStationError"></p>
                            </div>
                            <div class="form-group">
                                <label for="transitStation1" class="font-medium text-gray-700">経由駅 1</label>
                                <input type="text" id="transitStation1" name="primary_transit_stations[]" class="w-full mt-1" placeholder="例: 渋谷" autocomplete="off">
                            </div>
                            <div class="form-group hidden" id="transitStation2Wrapper">
                                <label for="transitStation2" class="font-medium text-gray-700">経由駅 2</label>
                                <input type="text" id="transitStation2" name="primary_transit_stations[]" class="w-full mt-1" placeholder="例: 品川" autocomplete="off">
                                <p class="error-message hidden" id="transitStation2Error"></p>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="form-group">
                                    <label for="primaryCommuteTime" class="font-medium text-gray-700">通勤時間 <span class="text-red-500">*</span></label>
                                    <input type="text" id="primaryCommuteTime" name="primaryCommuteTime" class="w-full mt-1 purchase-time-picker" placeholder="例: 1:30" minlength="3" maxlength="4">
                                    <p class="error-message hidden" id="primaryCommuteTimeError"></p>
                                </div>
                                <div class="form-group">
                                    <label for="primaryAmount" class="font-medium text-gray-700">金額 <span class="text-red-500">*</span></label>
                                    <input type="number" id="primaryAmount" name="primaryAmount" class="w-full mt-1" placeholder="例: 15000" min="1" max="99999">
                                    <p class="error-message hidden" id="primaryAmountError"></p>
                                </div>
                            </div>
                        </div>

                        <div id="additional-routes-container" class="space-y-4"></div>

                        <div class="flex justify-center space-x-4 mt-6">
                            <button type="button" id="addCandidateBtn"
                                    class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700">
                                候補経路を追加
                            </button>
                            <button type="submit"
                                    class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700">
                                送信確認
                            </button>
                        </div>
                        <div class="text-center">
                           <p id="addCandidateError" class="error-message hidden"></p>
                        </div>
                    </form>
                </div>
            `;
            break;
        case 'wf3_certificate':
            contentHtml = `
                <div class="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">資格申請</h1>
                    <form id="certificate-form" class="space-y-6">
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-2">申請種別 <span class="text-red-500">*</span></label>
                            <div class="flex items-center space-x-6">
                                <label class="inline-flex items-center">
                                    <input type="radio" name="applicationType" value="pre" class="form-radio text-blue-600" checked>
                                    <span class="ml-2 text-gray-700">取得前申請</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="applicationType" value="post" class="form-radio text-blue-600">
                                    <span class="ml-2 text-gray-700">取得後申請</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="certificateName" class="block text-sm font-medium text-gray-700">資格名 <span class="text-red-500">*</span></label>
                            <input type="text" id="certificateName" name="certificateName" placeholder="例: ITパスポート" class="mt-1 w-full" minlength="1" maxlength="50">
                            <p id="certificateNameError" class="error-message hidden"></p>
                        </div>

                        <div id="examDateWrapper" class="form-group">
                            <label for="examDate" class="block text-sm font-medium text-gray-700">受験日 <span class="text-red-500">*</span></label>
                            <input type="text" id="examDate" name="examDate" class="w-full mt-1 certificate-date-picker" placeholder="YYYY/MM/DD">
                            <p id="examDateError" class="error-message hidden"></p>
                        </div>
                        
                        <div class="form-group">
                            <label for="certificateFile" class="block text-sm font-medium text-gray-700">申請書を選択して下さい <span class="text-red-500">*</span></label>
                            <div class="flex items-center space-x-4 mt-2">
                                <label class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md cursor-pointer hover:bg-gray-300 transition-colors">
                                    <span>ファイルを選択</span>
                                    <input type="file" id="certificateFile" name="certificateFile" class="hidden">
                                </label>
                                <span id="fileNameDisplay" class="text-gray-600">選択されていません</span>
                            </div>
                            <p id="certificateFileError" class="error-message hidden"></p>
                        </div>

                        <div class="flex justify-center pt-4">
                            <button type="submit" class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700">
                                送信確認
                            </button>
                        </div>
                    </form>
                </div>
            `;
            break;
        case 'wf4_dependent':
            contentHtml = `
                <div class="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">扶養届け</h1>
                    <form id="dependent-form" class="space-y-6">
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-2">申請区分 <span class="text-red-500">*</span></label>
                            <div class="flex items-center space-x-6">
                                <label class="inline-flex items-center">
                                    <input type="radio" name="dependentApplicationType" value="register" class="form-radio text-blue-600" checked>
                                    <span class="ml-2 text-gray-700">登録</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="dependentApplicationType" value="remove" class="form-radio text-blue-600">
                                    <span class="ml-2 text-gray-700">解除</span>
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="dependentDate" class="block text-sm font-medium text-gray-700">日付 <span class="text-red-500">*</span></label>
                            <input type="text" id="dependentDate" name="dependentDate" class="w-full mt-1 dependent-date-picker" placeholder="YYYY/MM/DD">
                            <p id="dependentDateError" class="error-message hidden"></p>
                        </div>
                        <div class="form-group">
                            <label for="dependentRelationship" class="block text-sm font-medium text-gray-700">続柄 <span class="text-red-500">*</span></label>
                            <input type="text" id="dependentRelationship" name="dependentRelationship" class="w-full mt-1" placeholder="例: 子" minlength="1" maxlength="5">
                            <p id="dependentRelationshipError" class="error-message hidden"></p>
                        </div>
                        <div class="form-group">
                            <label for="dependentReason" class="block text-sm font-medium text-gray-700">理由 <span class="text-red-500">*</span></label>
                            <textarea id="dependentReason" name="dependentReason" rows="4" minlength="1" maxlength="256" class="w-full mt-1" placeholder="理由を入力してください"></textarea>
                            <p id="dependentReasonError" class="error-message hidden"></p>
                        </div>
                        <div class="flex justify-center pt-4">
                            <button type="submit" class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700">
                                送信確認
                            </button>
                        </div>
                    </form>
                </div>
            `;
            break;
        case 'wf5_month_end':
            contentHtml = `
                <div class="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">月末処理</h1>
                    <form id="monthEnd-form" class="space-y-6">
                        <div class="form-group">
                            <label for="processingMonth" class="block text-sm font-medium text-gray-700">日付を選択 <span class="text-red-500">*</span></label>
                            <input type="text" id="processingMonth" name="processingMonth" class="w-full mt-1 month-select-picker" placeholder="YYYY/MM">
                        </div>
                        <div class="form-group">
                            <label for="reportFile" class="block text-sm font-medium text-gray-700">添付ファイル <span class="text-red-500">*</span></label>
                            <div class="flex items-center space-x-4 mt-2">
                                <label class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md cursor-pointer hover:bg-gray-300 transition-colors">
                                    <span>ファイルを選択</span>
                                    <input type="file" id="reportFile" name="reportFile" class="hidden">
                                </label>
                                <span id="monthEndFileNameDisplay" class="text-gray-600">選択されていません</span>
                            </div>
                             <p class="text-xs text-gray-500 mt-2">※複数ある場合zipファイルとして１つにまとめてください</p>
                            <p id="reportFileError" class="error-message hidden"></p>
                        </div>
                        <div class="flex justify-center pt-4">
                            <button type="submit" class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700">
                                送信確認
                            </button>
                        </div>
                    </form>
                </div>
            `;
            break;
        case 'wf6_address_change':
            contentHtml = `
                <div class="bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-2xl mx-auto">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">住所変更</h1>
                    <form id="addressChangeForm" class="space-y-6">
                        <div class="form-group">
                            <label for="changeDate" class="block text-sm font-medium text-gray-700">日付 <span class="text-red-500">*</span></label>
                            <input type="text" id="changeDate" name="changeDate" class="w-full mt-1 address-date-picker" placeholder="YYYY/MM/DD">
                            <p id="changeDateError" class="error-message hidden"></p>
                        </div>
                        <div class="form-group">
                            <label for="postalCode" class="block text-sm font-medium text-gray-700">郵便番号 <span class="text-red-500">*</span></label>
                            <div class="flex items-center space-x-2 mt-1">
                                <input type="text" id="postalCode" name="postalCode" placeholder="例: 1000001" minlength="7" maxlength="7" class="w-full">
                                <button type="button" id="searchAddressBtn" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 whitespace-nowrap">
                                    郵便番号から検索
                                </button>
                            </div>
                            <p id="postalCodeError" class="error-message hidden"></p>
                        </div>
                        <div class="form-group">
                            <label for="newAddress" class="block text-sm font-medium text-gray-700">新住所 <span class="text-red-500">*</span></label>
                            <input type="text" id="newAddress" name="newAddress" class="w-full mt-1" placeholder="例: 東京都千代田区千代田" minlength="1" maxlength="100">
                            <p id="newAddressError" class="error-message hidden"></p>
                        </div>
                        <div class="form-group">
                            <label for="addressDetails" class="block text-sm font-medium text-gray-700">番地以降 (任意)</label>
                            <input type="text" id="addressDetails" name="addressDetails" class="w-full mt-1" placeholder="例: 1-1-1" maxlength="50">
                        </div>
                        <div class="form-group">
                            <label for="nearestStation" class="block text-sm font-medium text-gray-700">最寄駅 <span class="text-red-500">*</span></label>
                            <input type="text" id="nearestStation" name="nearestStation" class="w-full mt-1" placeholder="例: 東京駅" minlength="1" maxlength="20">
                            <p id="nearestStationError" class="error-message hidden"></p>
                        </div>
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-2">住民票転移届 <span class="text-red-500">*</span></label>
                            <div class="flex items-center space-x-6">
                                <label class="inline-flex items-center">
                                    <input type="radio" name="moveOutNotice" value="submitted" class="form-radio text-blue-600" checked>
                                    <span class="ml-2 text-gray-700">提出済</span>
                                </label>
                                <label class="inline-flex items-center">
                                    <input type="radio" name="moveOutNotice" value="not_submitted" class="form-radio text-blue-600">
                                    <span class="ml-2 text-gray-700">未提出</span>
                                </label>
                            </div>
                             <p id="moveOutNoticeError" class="error-message hidden"></p>
                        </div>
                        <div class="flex justify-center pt-4">
                            <button type="submit" class="px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700">
                                送信確認
                            </button>
                        </div>
                    </form>
                </div>
            `;
            break;
        default:
            contentHtml = `<p class="font-bold text-lg mb-4">ここより下はワークフローの種類により変動する</p>
                           <div id="dynamicContent" class="text-gray-800 text-xl font-medium">
                               選択されたワークフローは見つかりません。
                           </div>`;
            break;
    }
    // コンテンツを挿入
    dynamicWorkflowArea.innerHTML = contentHtml;

    // 💡 修正ポイント：HTMLコンテンツが挿入された後に、イベントリスナーを登録する
    switch (workflowId) {
        case 'wf1_attendance':
            addAttendanceFormListeners();
            break;
        case 'wf2_purchase':
            addSubscriptionFormListeners();
            break;
        case 'wf3_certificate':
            addCertificateFormListeners();
            break;
        case 'wf4_dependent':
            addDependentFormListeners();
            break;
        case 'wf5_month_end':
            addMonthEndFormListeners();
            break;
        case 'wf6_address_change':
            addAddressChangeFormListeners();
            break;
    }
}


// 各フォームのイベントリスナー設定関数

function addAttendanceFormListeners() {
    const attendanceForm = document.getElementById('attendanceForm');
    const reasonTypeRadios = document.getElementsByName('reasonType');
    const lateTimeSection = document.getElementById('lateTimeSection');
    const earlyLeaveTimeSection = document.getElementById('earlyLeaveTimeSection');
    const substituteDateSection = document.getElementById('substituteDateSection');
    const lateTimeSelect = document.getElementById('lateTime');
    const submitButton = document.getElementById('submitButton_attendance');
    const middleLeaveTimeSection = document.getElementById('middleLeaveTimeSection');
    const middleLeaveTimeSelect = document.getElementById('middleLeaveTime');

    // Flatpickrを初期化
    flatpickr(".attendance-date-picker", {
        dateFormat: "Y/m/d", // 表示とデータのフォーマットを YYYY/MM/DD に
        allowInput: true,    // 手入力を許可する
    });

    // 初期表示設定
    updateAttendanceFormSections();
    
    // ▼▼▼▼▼ バグ修正箇所 ▼▼▼▼▼
    // 遅刻時間のプルダウンを5分刻みで60分まで生成するように修正
    lateTimeSelect.innerHTML = '<option value="">選択してください</option>';
    for (let i = 5; i <= 60; i += 5) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${i}分`;
        lateTimeSelect.appendChild(option);
    }
    // ▲▲▲▲▲ バグ修正箇所 ▲▲▲▲▲

    generateTimeOptions(middleLeaveTimeSelect); // 中抜け時間は元のまま

    // 理由の選択が変更されたときの処理
    reasonTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateAttendanceFormSections);
    });

    function updateAttendanceFormSections() {
        const selectedReason = document.querySelector('input[name="reasonType"]:checked').value;
        const reasonSections = {
            '0': [], '1': [substituteDateSection], '2': [], '3': [lateTimeSection],
            '4': [earlyLeaveTimeSection], '5': [middleLeaveTimeSection], '6': []
        };
        Object.values(reasonSections).flat().forEach(section => {
            if (section) section.classList.add('hidden');
        });
        if (reasonSections[selectedReason]) {
            reasonSections[selectedReason].forEach(section => {
                if (section) section.classList.remove('hidden');
            });
        }
    }

    function generateTimeOptions(selectElement) {
        selectElement.innerHTML = '<option value="">選択してください</option>';
        for (let i = 5; i <= 60; i += 5) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}分`;
            selectElement.appendChild(option);
        }
    }

    if (submitButton) {
        submitButton.addEventListener('click', (event) => {
            event.preventDefault();
            
            let isValid = true;

            // 全てのエラーメッセージを一度非表示にする
            document.querySelectorAll('#attendanceForm .error-message').forEach(el => el.classList.add('hidden'));

            // 各入力値を取得
            const contactDate = document.getElementById('contactDate');
            const reason = document.getElementById('reason');
            const reasonType = document.querySelector('input[name="reasonType"]:checked').value;
            const substituteDate = document.getElementById('substituteDate');
            const lateTime = document.getElementById('lateTime');
            const earlyLeaveTime = document.getElementById('earlyLeaveTime');
            const middleLeaveTime = document.getElementById('middleLeaveTime');

            // エラー表示用のヘルパー関数
            const showError = (inputElement, message) => {
                const errorElement = document.getElementById(`${inputElement.id}Error`);
                if (errorElement) {
                    errorElement.textContent = message;
                    errorElement.classList.remove('hidden');
                }
                isValid = false;
            };

            // 1. 日付のチェック
            if (!contactDate.value.trim()) {
                showError(contactDate, '日付を入力してください。');
            }
            // 2. 理由のチェック
            if (!reason.value.trim()) {
                showError(reason, '理由を入力してください。');
            }
            
            // 3. 事由に応じたチェック
            if (reasonType === '1' && !substituteDate.value.trim()) {
                showError(substituteDate, '代休消化日を入力してください。');
            }
            if (reasonType === '3' && !lateTime.value) {
                showError(lateTime, '遅刻時間を選択してください。');
            }
            if (reasonType === '4' && !earlyLeaveTime.value.trim()) {
                showError(earlyLeaveTime, '早退時間を入力してください。');
            }
            if (reasonType === '5' && !middleLeaveTime.value) {
                showError(middleLeaveTime, '中抜け時間を選択してください。');
            }

            // 全てのチェックをパスした場合のみ、確認モーダルを表示
            if (!isValid) {
                return;
            }

            const confirmHtml = `
                <div class="space-y-2">
                    <p><strong>日付:</strong> ${contactDate.value}</p>
                    <p><strong>事由:</strong> ${getReasonText(reasonType)}</p>
                    ${reasonType === '3' ? `<p><strong>遅刻時間:</strong> ${lateTime.value}分</p>` : ''}
                    ${reasonType === '4' ? `<p><strong>早退時間:</strong> ${earlyLeaveTime.value}</p>` : ''}
                    ${reasonType === '5' ? `<p><strong>中抜け時間:</strong> ${middleLeaveTime.value}分</p>` : ''}
                    ${reasonType === '1' ? `<p><strong>代休消化日:</strong> ${substituteDate.value}</p>` : ''}
                    <p><strong>理由:</strong> ${reason.value}</p>
                </div>
            `;
            openConfirmationModal('勤怠連絡の確認', confirmHtml, () => {
                openMessageModal('送信成功', '勤怠連絡が正常に送信されました！', () => {
                    attendanceForm.reset();
                    updateAttendanceFormSections();
                });
            });
        });
    }
}

function getReasonText(reasonValue) {
    const reasons = {
        '0': '有給',
        '1': '代休',
        '2': '欠勤',
        '3': '遅刻',
        '4': '早退',
        '5': '中抜け',
        '6': '忌引き'
    };
    return reasons[reasonValue] || '';
}

function addSubscriptionFormListeners() {
    const subscriptionForm = document.getElementById('subscription-form');
    const addCandidateBtn = document.getElementById('addCandidateBtn');
    const additionalRoutesContainer = document.getElementById('additional-routes-container');
    const addCandidateError = document.getElementById('addCandidateError');
    let additionalRouteCount = 0;

    flatpickr(".purchase-date-picker", {
        dateFormat: "Y/m/d",
        allowInput: true,
        minDate: "today"
    });
    
    flatpickr(".purchase-time-picker", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        allowInput: true,
    });
    
    // 主経路の経由駅表示ロジック
    const transitStation1 = document.getElementById('transitStation1');
    const transitStation2Wrapper = document.getElementById('transitStation2Wrapper');

    const showTransit2 = () => {
        if (transitStation1.value.trim() !== '') {
            transitStation2Wrapper.classList.remove('hidden');
        } else {
            transitStation2Wrapper.classList.add('hidden');
        }
    };
    transitStation1.addEventListener('input', showTransit2);

    const limitAmountInput = (inputElement) => {
        inputElement.addEventListener('input', () => {
            let value = inputElement.value;
            value = value.replace(/[^0-9]/g, '');
            if (value.length > 5) {
                value = value.slice(0, 5);
            }
            inputElement.value = value;
        });
    };

    limitAmountInput(document.getElementById('primaryAmount'));

    addCandidateBtn.addEventListener('click', () => {
        addCandidateError.classList.add('hidden');
        if (additionalRouteCount >= 3) {
            addCandidateError.textContent = '候補経路は3つまでしか追加できません。';
            addCandidateError.classList.remove('hidden');
            return;
        }

        additionalRouteCount++;
        const newRouteHtml = `
            <div class="p-4 border border-dashed border-gray-300 rounded-lg space-y-4 additional-route">
                <h3 class="text-lg font-semibold text-gray-600">候補経路 ${additionalRouteCount}</h3>
                <div class="form-group">
                    <label for="additional_transit_station_1_${additionalRouteCount}" class="font-medium text-gray-700">経由駅 1</label>
                    <input type="text" id="additional_transit_station_1_${additionalRouteCount}" name="additional_transit_stations_${additionalRouteCount}[]" class="w-full mt-1" placeholder="例: 池袋" autocomplete="off">
                    <p class="error-message hidden" id="additional_transit_station_1_${additionalRouteCount}Error"></p>
                </div>
                <div class="form-group hidden" id="additional_transit_station_2_wrapper_${additionalRouteCount}">
                    <label for="additional_transit_station_2_${additionalRouteCount}" class="font-medium text-gray-700">経由駅 2</label>
                    <input type="text" id="additional_transit_station_2_${additionalRouteCount}" name="additional_transit_stations_${additionalRouteCount}[]" class="w-full mt-1" placeholder="例: 大崎" autocomplete="off">
                    <p class="error-message hidden" id="additional_transit_station_2_${additionalRouteCount}Error"></p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="font-medium text-gray-700">通勤時間</label>
                        <input type="text" name="additional_commute_time_${additionalRouteCount}" class="w-full mt-1 purchase-time-picker" placeholder="例: 1:30">
                    </div>
                    <div class="form-group">
                        <label class="font-medium text-gray-700">金額</label>
                        <input type="number" id="additional_amount_${additionalRouteCount}" name="additional_amount_${additionalRouteCount}" class="w-full mt-1" placeholder="例: 12000">
                    </div>
                </div>
            </div>
        `;
        additionalRoutesContainer.insertAdjacentHTML('beforeend', newRouteHtml);
        
        const newTransit1 = document.getElementById(`additional_transit_station_1_${additionalRouteCount}`);
        const newTransit2Wrapper = document.getElementById(`additional_transit_station_2_wrapper_${additionalRouteCount}`);
        
        newTransit1.addEventListener('input', () => {
            if (newTransit1.value.trim() !== '') {
                newTransit2Wrapper.classList.remove('hidden');
            } else {
                newTransit2Wrapper.classList.add('hidden');
            }
        });

        const newAmountInput = document.getElementById(`additional_amount_${additionalRouteCount}`);
        limitAmountInput(newAmountInput);

        const newTimePickers = additionalRoutesContainer.querySelectorAll('.purchase-time-picker:not(.flatpickr-input)');
        flatpickr(newTimePickers, {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true,
            allowInput: true,
        });
    });

    subscriptionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        
        document.querySelectorAll('#subscription-form .error-message').forEach(el => el.classList.add('hidden'));

        const showError = (elementId, message) => {
            const errorElement = document.getElementById(elementId + "Error");
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.remove('hidden');
            }
            isValid = false;
        };
        
        const purchaseDate = document.getElementById('purchaseDate');
        const nearestStation = document.getElementById('nearestStation');
        const destinationStation = document.getElementById('destinationStation');
        const primaryCommuteTime = document.getElementById('primaryCommuteTime');
        const primaryAmount = document.getElementById('primaryAmount');
        const commuteTimeRegex = /^[0-9:]+$/;
        const amountRegex = /^[0-9]+$/;

        if (!purchaseDate.value.trim()) showError('purchaseDate', '定期購入日を入力してください。');
        if (!nearestStation.value.trim()) showError('nearestStation', '最寄駅を入力してください。');
        if (!destinationStation.value.trim()) showError('destinationStation', '目的駅を入力してください。');
        
        if (!primaryCommuteTime.value.trim()) {
            showError('primaryCommuteTime', '通勤時間を入力してください。');
        } else if (!commuteTimeRegex.test(primaryCommuteTime.value.trim())) {
            showError('primaryCommuteTime', '半角数字とコロンのみで入力してください。');
        }

        if (!primaryAmount.value.trim()) {
            showError('primaryAmount', '金額を入力してください。');
        } else if (!amountRegex.test(primaryAmount.value.trim())) {
            showError('primaryAmount', '半角数字で入力してください。');
        } else if (primaryAmount.value.trim().length > 5) {
            showError('primaryAmount', '5桁以内で入力してください。');
        }
        
        if (!isValid) return;

        const formData = new FormData(subscriptionForm);
        
        const primaryTransitStations = formData.getAll('primary_transit_stations[]').filter(s => s.trim() !== '');
        let primaryTransitDisplay = '';
        if (primaryTransitStations.length > 0) {
            primaryTransitDisplay = primaryTransitStations.map((s, i) => `<li><strong>経由駅${i + 1}:</strong> ${s}</li>`).join('');
        } else {
             primaryTransitDisplay = `<li><strong>経由駅:</strong> なし</li>`;
        }

        let confirmHtml = `
            <div class="space-y-3">
                <p><strong>定期購入日:</strong> ${formData.get('purchaseDate')}</p>
                <h4 class="font-bold text-gray-800 pt-2">主経路</h4>
                <ul class="list-disc list-inside space-y-1 pl-2">
                    <li><strong>最寄駅:</strong> ${formData.get('nearestStation')}</li>
                    <li><strong>目的駅:</strong> ${formData.get('destinationStation')}</li>
                    ${primaryTransitDisplay}
                    <li><strong>通勤時間:</strong> ${formData.get('primaryCommuteTime')}</li>
                    <li><strong>金額:</strong> ${formData.get('primaryAmount')} 円</li>
                </ul>
            </div>
        `;

        const additionalRoutes = additionalRoutesContainer.querySelectorAll('.additional-route');
        if (additionalRoutes.length > 0) {
            confirmHtml += `<div class="mt-4 space-y-3">`;
            additionalRoutes.forEach((route, index) => {
                const routeNum = index + 1;
                
                const transitStations = formData.getAll(`additional_transit_stations_${routeNum}[]`).filter(s => s.trim() !== '');
                let transitDisplay = '';
                if (transitStations.length > 0) {
                    transitDisplay = transitStations.map((s, i) => `<li><strong>経由駅${i + 1}:</strong> ${s}</li>`).join('');
                } else {
                    transitDisplay = `<li><strong>経由駅:</strong> なし</li>`;
                }

                const time = formData.get(`additional_commute_time_${routeNum}`) || '未入力';
                const amount = formData.get(`additional_amount_${routeNum}`) || '未入力';

                confirmHtml += `
                    <h4 class="font-bold text-gray-800">候補経路 ${routeNum}</h4>
                    <ul class="list-disc list-inside space-y-1 pl-2">
                        ${transitDisplay}
                        <li><strong>通勤時間:</strong> ${time}</li>
                        <li><strong>金額:</strong> ${amount ? amount + ' 円' : '未入力'}</li>
                    </ul>
                `;
            });
            confirmHtml += `</div>`;
        }

        openConfirmationModal('定期購入申請の確認', confirmHtml, () => {
            openMessageModal('送信成功', '定期購入申請が正常に送信されました！', () => {
                subscriptionForm.reset();
                additionalRoutesContainer.innerHTML = '';
                transitStation2Wrapper.classList.add('hidden');
                addCandidateBtn.disabled = false;
            });
        });
    });
}


function addCertificateFormListeners() {
    const form = document.getElementById('certificate-form');
    const applicationTypeRadios = document.getElementsByName('applicationType');
    const examDateWrapper = document.getElementById('examDateWrapper');
    const certificateFileInput = document.getElementById('certificateFile');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    flatpickr(".certificate-date-picker", {
        dateFormat: "Y/m/d",
        allowInput: true,
    });

    applicationTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'pre') {
                examDateWrapper.classList.remove('hidden');
            } else {
                examDateWrapper.classList.add('hidden');
            }
        });
    });

    certificateFileInput.addEventListener('change', () => {
        if (certificateFileInput.files.length > 0) {
            fileNameDisplay.textContent = certificateFileInput.files[0].name;
        } else {
            fileNameDisplay.textContent = '選択されていません';
        }
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        document.querySelectorAll('#certificate-form .error-message').forEach(el => el.classList.add('hidden'));

        const showError = (elementId, message) => {
            const errorElement = document.getElementById(elementId + 'Error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.remove('hidden');
            }
            isValid = false;
        };

        const applicationType = document.querySelector('input[name="applicationType"]:checked').value;
        const certificateName = document.getElementById('certificateName');
        const examDate = document.getElementById('examDate');
        const certificateFile = document.getElementById('certificateFile');

        if (!certificateName.value.trim()) {
            showError('certificateName', '資格名を入力して下さい');
        }
        if (applicationType === 'pre' && !examDate.value.trim()) {
            showError('examDate', '受験日を入力して下さい');
        }
        if (certificateFile.files.length === 0) {
            showError('certificateFile', '申請書を添付して下さい');
        }

        if (!isValid) return;

        let confirmHtml = `
            <div class="space-y-2">
                <p><strong>申請種別:</strong> ${applicationType === 'pre' ? '取得前申請' : '取得後申請'}</p>
                <p><strong>資格名:</strong> ${certificateName.value}</p>
                ${applicationType === 'pre' ? `<p><strong>受験日:</strong> ${examDate.value}</p>` : ''}
                <p><strong>申請書:</strong> ${certificateFile.files[0].name}</p>
            </div>
        `;

        openConfirmationModal('資格申請の確認', confirmHtml, () => {
            openMessageModal('送信成功', '資格申請が正常に送信されました！', () => {
                form.reset();
                fileNameDisplay.textContent = '選択されていません';
                examDateWrapper.classList.remove('hidden');
            });
        });
    });
}

function addDependentFormListeners() {
    const form = document.getElementById('dependent-form');

    flatpickr(".dependent-date-picker", {
        dateFormat: "Y/m/d",
        allowInput: true,
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        document.querySelectorAll('#dependent-form .error-message').forEach(el => el.classList.add('hidden'));

        const showError = (elementId, message) => {
            const errorElement = document.getElementById(elementId + 'Error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.remove('hidden');
            }
            isValid = false;
        };

        const applicationTypeInput = document.querySelector('input[name="dependentApplicationType"]:checked');
        const dependentDate = document.getElementById('dependentDate');
        const dependentRelationship = document.getElementById('dependentRelationship');
        const dependentReason = document.getElementById('dependentReason');

        if (!applicationTypeInput) {
            // This case should not happen if one is checked by default, but as a safeguard.
            alert('申請区分を選択してください。');
            isValid = false;
        }
        if (!dependentDate.value.trim()) showError('dependentDate', '日付を入力してください。');
        if (!dependentRelationship.value.trim()) showError('dependentRelationship', '続柄を入力してください。');
        if (!dependentReason.value.trim()) showError('dependentReason', '理由を入力してください。');
        
        if (!isValid) return;

        const applicationType = applicationTypeInput.value === 'register' ? '登録' : '解除';
        
        const confirmHtml = `
            <div class="space-y-2">
                <p><strong>申請区分:</strong> ${applicationType}</p>
                <p><strong>日付:</strong> ${dependentDate.value}</p>
                <p><strong>続柄:</strong> ${dependentRelationship.value}</p>
                <p><strong>理由:</strong> ${dependentReason.value}</p>
            </div>
        `;

        openConfirmationModal('扶養届けの確認', confirmHtml, () => {
            openMessageModal('送信成功', '扶養届けが正常に送信されました！', () => {
                form.reset();
            });
        });
    });
}

function addMonthEndFormListeners() {
    const form = document.getElementById('monthEnd-form');
    
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0); // 月末日を取得

    flatpickr(".month-select-picker", {
        plugins: [
            new monthSelectPlugin({
                shorthand: true, 
                dateFormat: "Y/m",
                altFormat: "Y年 F", 
            })
        ],
        defaultDate: currentDate,
        minDate: lastMonth,
        maxDate: nextMonth,
    });

    const reportFileInput = document.getElementById('reportFile');
    const fileNameDisplay = document.getElementById('monthEndFileNameDisplay');

    reportFileInput.addEventListener('change', () => {
        if (reportFileInput.files.length > 0) {
            fileNameDisplay.textContent = reportFileInput.files[0].name;
        } else {
            fileNameDisplay.textContent = '選択されていません';
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        document.querySelectorAll('#monthEnd-form .error-message').forEach(el => el.classList.add('hidden'));
        
        const showError = (elementId, message) => {
            const errorElement = document.getElementById(elementId + 'Error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.classList.remove('hidden');
            }
            isValid = false;
        };

        if (reportFileInput.files.length === 0) {
            showError('reportFile', 'ファイルの添付が行われていません。');
        }

        if (!isValid) return;

        const processingMonth = document.getElementById('processingMonth').value;
        const confirmHtml = `
            <div class="space-y-2">
                <p><strong>対象年月:</strong> ${processingMonth}</p>
                <p><strong>添付ファイル:</strong> ${reportFileInput.files[0].name}</p>
            </div>
        `;

        openConfirmationModal('月末処理の確認', confirmHtml, () => {
            openMessageModal('送信成功', '月末処理が正常に送信されました！', () => {
                form.reset();
                fileNameDisplay.textContent = '選択されていません';
                // Flatpickrもリセット
                const monthPicker = document.querySelector(".month-select-picker")._flatpickr;
                monthPicker.setDate(new Date());
            });
        });
    });
}


function addAddressChangeFormListeners() {
    const form = document.getElementById('addressChangeForm');
    
    flatpickr(".address-date-picker", {
        dateFormat: "Y/m/d",
        allowInput: true,
    });

    const searchAddressBtn = document.getElementById('searchAddressBtn');
    if (searchAddressBtn) {
        searchAddressBtn.addEventListener('click', async () => {
            const postalCodeInput = document.getElementById('postalCode');
            const newAddressInput = document.getElementById('newAddress');
            const postalCode = postalCodeInput.value.replace('-', '');

            if (postalCode.length !== 7 || !/^\d{7}$/.test(postalCode)) {
                openMessageModal('入力エラー', '7桁の半角数字で郵便番号を入力してください。', () => {}, true);
                return;
            }

            try {
                const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`);
                const data = await response.json();

                if (data.results) {
                    const result = data.results[0];
                    const address = result.address1 + result.address2 + result.address3;
                    newAddressInput.value = address;
                } else {
                    openMessageModal('検索失敗', '指定された郵便番号の住所が見つかりませんでした。', () => {}, true);
                }
            } catch (error) {
                console.error('住所検索エラー:', error);
                openMessageModal('通信エラー', '住所検索中にエラーが発生しました。', () => {}, true);
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        document.querySelectorAll('#addressChangeForm .error-message').forEach(el => el.classList.add('hidden'));

        const showError = (elementId, message) => {
            const errorElement = document.getElementById(elementId + 'Error');
            if(errorElement) {
                errorElement.textContent = message;
                errorElement.classList.remove('hidden');
            }
            isValid = false;
        };

        const changeDate = document.getElementById('changeDate');
        const postalCode = document.getElementById('postalCode');
        const newAddress = document.getElementById('newAddress');
        const nearestStation = document.getElementById('nearestStation');
        const moveOutNotice = document.querySelector('input[name="moveOutNotice"]:checked');

        if (!changeDate.value.trim()) showError('changeDate', '日付を入力してください。');
        if (postalCode.value.trim().length !== 7 || !/^\d{7}$/.test(postalCode.value.trim())) showError('postalCode', '郵便番号は7桁の半角数字で入力してください。');
        if (!newAddress.value.trim()) showError('newAddress', '新住所を入力してください。');
        if (!nearestStation.value.trim()) showError('nearestStation', '最寄駅を入力してください。');
        if (!moveOutNotice) showError('moveOutNotice', '住民票転移届の状況を選択してください。');

        if (!isValid) return;

        const formData = new FormData(form);
        const confirmHtml = `
            <div class="space-y-2">
                <p><strong>日付:</strong> ${formData.get('changeDate')}</p>
                <p><strong>郵便番号:</strong> ${formData.get('postalCode')}</p>
                <p><strong>新住所:</strong> ${formData.get('newAddress')}</p>
                <p><strong>番地以降:</strong> ${formData.get('addressDetails') || '未入力'}</p>
                <p><strong>最寄駅:</strong> ${formData.get('nearestStation')}</p>
                <p><strong>住民票転移届:</strong> ${formData.get('moveOutNotice') === 'submitted' ? '提出済' : '未提出'}</p>
            </div>
        `;
        openConfirmationModal('住所変更の確認', confirmHtml, () => {
            openMessageModal('送信成功', '住所変更が正常に送信されました！', () => {
                form.reset();
            });
        });
    });
}

function clearFormInputs(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type === 'file') {
            input.value = ''; // ファイル入力の値をクリア
        } else if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false; // チェックボックスとラジオボタンをクリア
        } else {
            input.value = ''; // それ以外の入力をクリア
        }
    });
}


// ページ読み込み完了時に最初にログイン画面をレンダリング
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        renderWorkflowScreen();
    } else {
        renderLoginScreen();
    }
});

