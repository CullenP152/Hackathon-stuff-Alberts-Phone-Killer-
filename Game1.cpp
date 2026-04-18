#include <emscripten.h>
#include <iostream>
#include <string>
#include <vector>
#include <ctime>
#include <algorithm>

using namespace std;

string secretWord;
string discovered;
int lives;
string guesses;
bool gameOver;
bool initialized = false;
int i = 0;

void printState() {
    cout << "\nWord: (" << secretWord.length() << " letters) " << discovered << endl;
    cout << "Lives: " << lives << endl;
    cout << "Guessed so far: " << (guesses.empty() ? "none" : guesses) << endl;
    cout << "Guess a letter or the whole word:" << endl;
}

void initGame() {
    vector<string> words = {"hacking", "umbc", "developer", "coding", "hackathon"};
    srand(static_cast<unsigned int>(time(0)));
    secretWord = words[rand() % words.size()];
    discovered = string(secretWord.length(), '_');
    lives = 6;
    guesses = "";
    gameOver = false;
    initialized = true;
    i = 0;
    cout << "--- Welcome to Hangman ---" << endl;
    printState();
}

extern "C" {
    void receive_input(const char* input) {
        if (!initialized) return;
        if (gameOver) {
            cout << "Refresh the page to play again!" << endl;
            return;
        }

        string s = input;
        if (s.empty()) return;

        // Convert input to lowercase
        for (auto &c : s) c = tolower(c);

        // Word guess logic
        if (s.length() > 1) {
            if (s == secretWord) {
                discovered = secretWord;
                cout << "Amazing! You guessed the whole word!" << endl;
            } else {
                cout << "Incorrect word guess!" << endl;
                lives--;
                if (lives > 0) printState();
            }
        } else {
            // Letter guess logic
            char guess = s[0];
            if (guesses.find(guess) != string::npos) {
                cout << "You already guessed '" << guess << "'!" << endl;
                printState();
                return;
            }

            if (!guesses.empty()) guesses += ",";
            guesses += guess;

            if (secretWord.find(guess) != string::npos) {
                cout << "Correct!" << endl;
                for (size_t j = 0; j < secretWord.length(); ++j) {
                    if (secretWord[j] == guess) discovered[j] = guess;
                }
            } else {
                cout << "Wrong!" << endl;
                lives--;
            }
        }

        // Win/Loss Condition Checks
        if (discovered == secretWord) {
            cout << "\nCongratulations! The word was: " << secretWord << endl;
            gameOver = true;
            EM_ASM({
                var overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;';
                overlay.innerHTML = '<h1 style="color:#4cff72;font-size:3rem;margin-bottom:20px;">🎉 You Win!</h1>' +
                                    '<button onclick="window.location.href=\'site.html\'" style="background:#4cff72;color:#000;padding:14px 32px;border:none;border-radius:8px;font-size:1.2rem;font-weight:bold;cursor:pointer;">Back to Main Menu</button>';
                document.body.appendChild(overlay);
            });
        } else if (lives <= 0) {
            cout << "\nGame Over! The word was: " << secretWord << endl;
            gameOver = true;
            EM_ASM({
                var overlay = document.createElement('div');
                overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;';
                overlay.innerHTML = '<h1 style="color:#ff4c4c;font-size:3rem;margin-bottom:20px;">💀 You Lose!</h1>' +
                                    '<button onclick="window.location.href=\'site.html\'" style="background:#ff4c4c;color:#fff;padding:14px 32px;border:none;border-radius:8px;font-size:1.2rem;font-weight:bold;cursor:pointer;">Back to Main Menu</button>';
                document.body.appendChild(overlay);
            });
        } else if (s.length() <= 1) {
            printState();
        }
    }
}

int main() {
    initGame();
    return 0;
}
