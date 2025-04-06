import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <Link href="/">
              <span className="text-primary font-bold cursor-pointer">SchedulEase</span>
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SchedulEase. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
