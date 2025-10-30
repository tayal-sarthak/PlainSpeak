

echo "Welcome to PlainSpeak Web! My name is Sarthak Tayal. Enjoy!"
echo "======================================"
echo ""

if [ ! -f "package.json" ]; then
    echo "[error] please run this script from the plainspeak/web directory"
    echo "        run: cd web && ./start.sh"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "installing dependencies..."
    npm install
    echo "[ok] dependencies installed"
    echo ""
fi

echo "checking if backend is running on port 5001..."
if ! curl -s http://localhost:5001 > /dev/null 2>&1; then
    echo ""
    echo "[warning] backend is not running"
    echo ""
    echo "please start the backend in another terminal:"
    echo "  cd ../backend"
    echo "  python app.py"
    echo ""
    echo "press enter once the backend is running, or ctrl+c to exit..."
    read
fi

echo ""
echo "starting plainspeak web app"
echo "  frontend: http://localhost:3000"
echo "  backend:  http://localhost:5001"
echo ""
echo "press ctrl+c to stop"
echo ""

npm run dev
