"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Building2,
  FileText,
  Shield,
  Calculator,
  Star,
  CheckCircle,
  Users,
  BarChart3,
  DollarSign,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">EtaFi</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                href="#technology"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Technology
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                {session ? "Dashboard" : "Live Demo"}
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-700 font-medium text-sm">
                        {session.user?.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-700 hidden sm:block">
                      {session.user?.name || session.user?.email}
                    </span>
                  </div>
                  <Link href="/dashboard">
                    <Button className="bg-black hover:bg-gray-800 text-white text-sm">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/api/auth/signout">
                    <Button variant="ghost" className="text-sm">
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="text-sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="bg-black hover:bg-gray-800 text-white text-sm">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-gray-50 rounded-full px-4 py-2 mb-8">
            <Star className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600 font-medium">
              {session ? "Welcome back!" : "Professional accounting software"}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6 leading-tight">
            {session ? (
              <>
                Welcome back, {session.user?.name?.split(" ")[0] || "User"}!
                <br />
                <span className="font-normal">
                  Ready to manage your accounts?
                </span>
              </>
            ) : (
              <>
                Complete accounting
                <br />
                <span className="font-normal">for growing businesses</span>
              </>
            )}
          </h1>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            {session ? (
              <>
                Access your dashboard to manage projects, track expenses, create
                invoices, and generate financial reports. Everything you need to
                streamline your accounting workflow.
              </>
            ) : (
              <>
                Full-featured accounting platform with chart of accounts,
                invoice management, automated journal posting, tax code
                handling, and comprehensive financial reporting. Built for
                accounting professionals managing multiple organizations.
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button className="bg-black hover:bg-gray-800 text-white px-8 py-3">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/dashboard/projects">
                  <Button variant="outline" className="px-8 py-3">
                    Manage Projects
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button className="bg-black hover:bg-gray-800 text-white px-8 py-3">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="px-8 py-3">
                    View Live Demo
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="text-2xl font-light text-gray-900 mb-1">
                Multi-Org
              </div>
              <div className="text-sm text-gray-500">Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-gray-900 mb-1">RBAC</div>
              <div className="text-sm text-gray-500">Security</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-light text-gray-900 mb-1">Auto</div>
              <div className="text-sm text-gray-500">Posting</div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              Professional accounting features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete accounting solution with enterprise-grade features for
              modern businesses.
            </p>
          </div>

          <div className="space-y-16">
            {/* Feature 1 - Chart of Accounts & Journal Posting */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Calculator className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">
                  Chart of accounts & automated posting
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Complete chart of accounts management with automated journal
                  entry generation. Create invoices and automatically post
                  balanced journal entries with intelligent account mapping by
                  expense groups (Material, Services, Equipment, Labor).
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Automated debit/credit journal entries
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    5-group expense classification system
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    General ledger with real-time balances
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-8 h-80 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Calculator className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-sm">Chart of Accounts & Journal Entries</p>
                </div>
              </div>
            </div>

            {/* Feature 2 - Tax Codes & Invoice Management */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="md:order-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">
                  Tax codes & invoice management
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Comprehensive tax code management with support for GST, HST,
                  QST and custom tax rates. Create detailed invoices with
                  automatic tax calculations and link to projects and activities
                  for precise cost tracking.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Canadian tax codes (GST/HST/QST)
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Automatic HT/TTC calculations
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Project-based invoice tracking
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-8 h-80 flex items-center justify-center md:order-1">
                <div className="text-center text-gray-400">
                  <DollarSign className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-sm">Tax Management & Invoicing</p>
                </div>
              </div>
            </div>

            {/* Feature 3 - Multi-Organization & RBAC */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Building2 className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">
                  Multi-organization & role-based access
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Manage multiple client organizations with complete data
                  isolation. 8-level role hierarchy from Owner to Read-only
                  access, perfect for accounting firms with varying staff
                  responsibilities and client needs.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Complete data isolation per organization
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    8-level role hierarchy (Owner to Read-only)
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Perfect for accounting firms
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-8 h-80 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Users className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-sm">Multi-Tenant Architecture</p>
                </div>
              </div>
            </div>

            {/* Feature 4 - Project Management & Activity Tracking */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="md:order-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-4">
                  Project management & cost tracking
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Complete project and activity management with budget tracking
                  across 5 expense groups. Track costs, manage budgets, create
                  project templates, and generate detailed financial reports for
                  better project profitability analysis.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Project & activity cost tracking
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Budget management with alerts
                  </li>
                  <li className="flex items-center text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    Reusable project templates
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-8 h-80 flex items-center justify-center md:order-1">
                <div className="text-center text-gray-400">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-sm">Project & Budget Management</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      {/* Technology Stack */}
      <section id="technology" className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            Built for accounting professionals
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Secure, compliant architecture ensuring data integrity, audit
            trails, and multi-organization isolation that accounting firms
            require for client confidentiality and regulatory compliance.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Data Security</h3>
              <p className="text-sm text-gray-500">
                Multi-tenant isolation & encryption
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Audit Trails</h3>
              <p className="text-sm text-gray-500">
                Complete transaction history
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">
                Role Management
              </h3>
              <p className="text-sm text-gray-500">
                8-level access control system
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">
                Compliance Ready
              </h3>
              <p className="text-sm text-gray-500">
                Canadian tax & accounting standards
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-light text-gray-900 mb-6">
            {session
              ? "Need help getting started?"
              : "Ready to streamline your accounting?"}
          </h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            {session ? (
              <>
                Explore our comprehensive documentation, watch tutorials, or
                contact support to make the most of your EtaFi accounting
                platform.
              </>
            ) : (
              <>
                Join accounting professionals using EtaFi to manage multiple
                organizations, automate journal entries, and provide better
                financial insights to their clients.
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button className="bg-black hover:bg-gray-800 text-white px-8 py-3">
                    Continue to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/dashboard/help">
                  <Button variant="outline" className="px-8 py-3">
                    Get Help
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button className="bg-black hover:bg-gray-800 text-white px-8 py-3">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="px-8 py-3">
                    Explore Live Demo
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center space-x-3 mb-8 md:mb-0">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <span className="text-xl font-semibold text-gray-900">
                  EtaFi
                </span>
                <p className="text-sm text-gray-500">
                  Professional accounting software
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Documentation
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Support
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-500">
              © 2024 EtaFi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
