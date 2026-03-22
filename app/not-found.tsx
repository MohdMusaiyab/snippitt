"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Compass } from "lucide-react";
import Button from "@/app/components/Button";

export default function NotFound() {
  return (
    <div className="min-h-[90vh] bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">

        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <p className="text-[140px] sm:text-[180px] font-extrabold text-gray-100 leading-none select-none tracking-tighter">
            404
          </p>
          {/* Icon centered over the 404 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ delay: 0.6, duration: 0.6, ease: "easeInOut" }}
              className="w-16 h-16 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center"
            >
              <Compass size={28} className="text-indigo-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-8 space-y-6"
        >
          {/* Text */}
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Page not found
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved. Double-check the URL or head back home.
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <ArrowLeft size={15} />
              Go back
            </button>
            <Link href="/" className="flex-1">
              <Button
                variant="primary"
                icon={<Home size={15} />}
                className="w-full rounded-xl shadow-sm shadow-indigo-200"
              >
                Back to home
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-xs text-gray-400 mt-6"
        >
          If you think this is a mistake,{" "}
          <Link
            href="/contact"
            className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
          >
            let us know
          </Link>
        </motion.p>

      </div>
    </div>
  );
}