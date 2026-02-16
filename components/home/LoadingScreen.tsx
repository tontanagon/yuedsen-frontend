export default function LoadingScreen() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 font-sans">
            <div className="relative w-24 h-24">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-red-200 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">
                    🤕
                </div>
            </div>
            <p className="mt-8 text-lg font-bold text-gray-600 animate-pulse">กำลังโหลดข้อมูล...</p>
        </div>
    );
}
