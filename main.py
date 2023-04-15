from flask import Flask, render_template, send_from_directory, redirect, request
from threading import Thread
import os, httpx, sys

app = Flask(__name__)

slash = "\\" if sys.platform == 'win32' else "/"

if "songs" not in os.listdir():
    os.mkdir("songs")

def rewrite_name():
    for song in os.listdir(f".{slash}songs"):
        if "#" in song:
            os.rename(f".\songs\{song}", f".\songs\{song}".replace("#", "_"))
        if "'" in song:
            os.rename(f".\songs\{song}", f".\songs\{song}".replace("'", "_"))
        if '"' in song:
            os.rename(f".\songs\{song}", f".\songs\{song}".replace('"', "_"))
        if "’" in song:
            os.rename(f".\songs\{song}", f".\songs\{song}".replace('’', "_"))

def download(song):
    os.system(f"spotdl {song}")
    for i in os.listdir("."):
        if i.endswith(".mp3"):
            try:
                os.rename(f"{i}", f".\songs\{i}")
            except FileExistsError as e:
                os.remove(i)
                print("File Already Exists")
    rewrite_name()

@app.route("/")
@app.route("/home", methods=["GET", "POST"])
def home_page():
    songs_list = os.listdir(f".{slash}songs")
    rewrite_name()
    if request.method=="POST":
        link = request.form['spotdl']
        if "open.spotify" in link:    
            t = Thread(target=download, args=(link, ))
            t.start()
        return redirect("/home")
    return render_template("index.html", songs = songs_list, play_song = "")

@app.route("/about")
def about_page():
    songs_list = os.listdir(f".{slash}songs")
    return render_template("about.html", songs = songs_list)

@app.route("/<song_name>")
def home_play(song_name):
    songs_list = os.listdir(f".{slash}songs")
    return render_template("index.html", songs = songs_list, play_song = song_name)

@app.route("/updates", methods = ["GET", "POST"])
def update():
    if request.method == "POST":
        print(request.form)
    return redirect(request.url)

@app.route("/songs/<song_name>")
def upload_music(song_name):
    return send_from_directory(f".{slash}songs{slash}", song_name)

app.run(debug=True)