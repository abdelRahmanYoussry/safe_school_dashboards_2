import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Loader2, Globe } from "lucide-react";
import { Redirect } from "wouter";
import { useTranslation } from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useCallback } from "react";

const BRAND_GREEN = "#045655";
const LIGHT_BG = "#F9F9F9";

const onboardingSlides = [
    {
        title: "نظام منظم لإدارة الاستلام",
        body: "منصة ذكية تساعد المدرسة على تنظيم عملية استلام الطلاب بدقة، وتقليل الازدحام، وضمان أعلى مستويات الأمان.",
    },
    {
        title: "متابعة فورية لحضور الطلاب",
        body: "تابع حضور وغياب الطلاب لحظةً بلحظة، مع إشعارات آنية لأولياء الأمور وتقارير يومية شاملة.",
    },
    {
        title: "بيئة مدرسية أكثر أماناً",
        body: "نحمي أطفالك من خلال نظام تحقق متطور وتنسيق سلس بين الإدارة وأولياء الأمور لضمان سلامتهم.",
    },
];

export default function LoginPage() {
    const { user, loginMutation } = useAuth();
    const { t, i18n } = useTranslation();
    const [activeSlide, setActiveSlide] = useState(0);
    const [isFading, setIsFading] = useState(false);

    const goToSlide = useCallback((index: number) => {
        setIsFading(true);
        setTimeout(() => {
            setActiveSlide(index);
            setIsFading(false);
        }, 350);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((prev: number) => {
                const nextSlide = (prev + 1) % onboardingSlides.length;
                goToSlide(nextSlide);
                return nextSlide;
            });
        }, 4000);
        return () => clearInterval(interval);
    }, [goToSlide]);

    const form = useForm({
        resolver: zodResolver(insertUserSchema.pick({ email: true, password: true })),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    if (user) {
        return <Redirect to="/" />;
    }

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: LIGHT_BG }}>
            {/* ===== LEFT SIDE — Login Form ===== */}
            <div
                className="flex flex-col w-full lg:w-1/2 min-h-screen relative"
                style={{ backgroundColor: LIGHT_BG }}
            >
                {/* Language Switcher */}
                <div className="absolute top-5 right-5 rtl:left-5 rtl:right-auto z-50">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border text-sm font-medium"
                                style={{
                                    borderColor: BRAND_GREEN,
                                    color: BRAND_GREEN,
                                    background: "transparent",
                                }}
                            >
                                <Globe className="w-4 h-4 mr-1 rtl:ml-1 rtl:mr-0" />
                                {i18n.language.toUpperCase()}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={() => i18n.changeLanguage("ar")}>
                                العربية
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => i18n.changeLanguage("en")}>
                                English
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => i18n.changeLanguage("ur")}>
                                اردو
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Form Container */}
                <div className="flex flex-col flex-1 items-center justify-center px-8 py-16 sm:px-16">
                    {/* Logo */}
                    <div className="mb-10 flex flex-col items-center">
                        <img
                            src="/logo.png"
                            alt="Safe School Logo"
                            className="h-20 w-auto object-contain select-none"
                            draggable={false}
                        />
                    </div>

                    {/* Heading */}
                    <div className="w-full max-w-sm mb-8 text-center">
                        <h1
                            className="text-2xl font-bold mb-1"
                            style={{ color: BRAND_GREEN }}
                        >
                            {t("تسجيل الدخول")}
                        </h1>
                        <p className="text-sm text-gray-500">
                            {t("منصة ذكية لتنظيم تسليم الأطفال لذويهم بأمان")}
                        </p>
                    </div>

                    {/* Form */}
                    <div className="w-full max-w-sm">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit((data) =>
                                    loginMutation.mutate(data)
                                )}
                                className="space-y-5"
                            >
                                {/* Email */}
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel
                                                className="text-sm font-semibold"
                                                style={{ color: BRAND_GREEN }}
                                            >
                                                {t("Email Address")}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 rtl:right-3 rtl:left-auto"
                                                        style={{ color: BRAND_GREEN }}
                                                    />
                                                    <Input
                                                        placeholder="admin@school.com"
                                                        className="pl-10 rtl:pr-10 rtl:pl-3 h-11 bg-white border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl shadow-sm transition-shadow focus:shadow-md"
                                                        style={{
                                                            borderColor: "#E5E7EB",
                                                            outlineColor: BRAND_GREEN,
                                                        }}
                                                        onFocus={(e) =>
                                                            (e.currentTarget.style.borderColor = BRAND_GREEN)
                                                        }
                                                        {...field}
                                                        onBlur={(e) => {
                                                            field.onBlur();
                                                            e.currentTarget.style.borderColor = "#E5E7EB";
                                                        }}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />

                                {/* Password */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel
                                                className="text-sm font-semibold"
                                                style={{ color: BRAND_GREEN }}
                                            >
                                                {t("Password")}
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Lock
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 rtl:right-3 rtl:left-auto"
                                                        style={{ color: BRAND_GREEN }}
                                                    />
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        className="pl-10 rtl:pr-10 rtl:pl-3 h-11 bg-white border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl shadow-sm transition-shadow focus:shadow-md"
                                                        style={{
                                                            borderColor: "#E5E7EB",
                                                            outlineColor: BRAND_GREEN,
                                                        }}
                                                        onFocus={(e) =>
                                                            (e.currentTarget.style.borderColor = BRAND_GREEN)
                                                        }
                                                        {...field}
                                                        onBlur={(e) => {
                                                            field.onBlur();
                                                            e.currentTarget.style.borderColor = "#E5E7EB";
                                                        }}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-red-500 text-xs" />
                                        </FormItem>
                                    )}
                                />

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    className="w-full h-11 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:opacity-90 active:scale-[0.98] mt-2"
                                    style={{ backgroundColor: BRAND_GREEN }}
                                    disabled={loginMutation.isPending}
                                >
                                    {loginMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin rtl:ml-2 rtl:mr-0" />
                                            {t("Signing In...")}
                                        </>
                                    ) : (
                                        t("Sign In")
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </div>

                    {/* Footer */}
                    <p className="mt-12 text-xs text-gray-400 text-center">
                        © 2026 Algoriza Safe School
                    </p>
                </div>
            </div>

            {/* ===== RIGHT SIDE — Onboarding Carousel (hidden on mobile) ===== */}
            <div
                className="hidden lg:flex flex-col w-1/2 min-h-screen items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: BRAND_GREEN }}
            >
                {/* Subtle decorative circles */}
                <div
                    className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-10"
                    style={{ backgroundColor: "#ffffff" }}
                />
                <div
                    className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full opacity-10"
                    style={{ backgroundColor: "#ffffff" }}
                />

                {/* Slide content */}
                <div
                    className="relative z-10 flex flex-col items-center justify-center px-12 text-center"
                    style={{
                        opacity: isFading ? 0 : 1,
                        transition: "opacity 0.35s ease-in-out",
                    }}
                >
                    {/* Illustration */}
                    <div className="mb-8 flex items-center justify-center">
                        <img
                            src="/onBoarding.png"
                            alt="Safe School Illustration"
                            className="w-72 h-72 object-contain drop-shadow-xl select-none"
                            draggable={false}
                        />
                    </div>

                    {/* Slide text */}
                    <h2 className="text-white text-2xl font-bold mb-3 leading-snug">
                        {onboardingSlides[activeSlide].title}
                    </h2>
                    <p className="text-white/75 text-sm leading-relaxed max-w-xs">
                        {onboardingSlides[activeSlide].body}
                    </p>
                </div>

                {/* Dot Indicators */}
                <div className="absolute bottom-12 flex items-center gap-2 z-10">
                    {onboardingSlides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goToSlide(i)}
                            aria-label={`Go to slide ${i + 1}`}
                            className="transition-all duration-300 rounded-full focus:outline-none"
                            style={{
                                width: i === activeSlide ? "28px" : "10px",
                                height: "10px",
                                backgroundColor:
                                    i === activeSlide ? "#ffffff" : "rgba(255,255,255,0.4)",
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
