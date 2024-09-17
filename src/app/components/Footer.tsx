import { FaTelegram, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full py-4 text-center font-jetbrains-mono">
      <p className="text-xs mb-2 text-gray-600">
        Эта история создана Искусственным Интеллектом, если с ней что-то не так - 
        <a 
          href="https://twitter.com/sergeonsamui" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 transition-colors ml-1"
        >
          напишите мне <FaTwitter className="inline-block" />
        </a>
      </p>
      <a
        href="https://t.me/sergiobulaev"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center"
      >
        <FaTelegram className="mr-2" />
        Подпишитесь на мой канал про AI
      </a>
      <p className="mt-2 text-sm text-gray-600">
        © Sergey Bulaev 2024
      </p>
    </footer>
  );
}