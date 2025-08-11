#!/bin/bash

# 🔍 環境別クイックチェックスクリプト
# 使用方法: ./scripts/quick-check.sh [dev|staging|production]

set -e

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ヘルパー関数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# HTTP レスポンス確認
check_http() {
    local url=$1
    local name=$2
    
    log_info "確認中: $name ($url)"
    
    if response=$(curl -s -w "%{http_code}:%{time_total}" -o /dev/null "$url" 2>/dev/null); then
        http_code=$(echo "$response" | cut -d: -f1)
        time_total=$(echo "$response" | cut -d: -f2)
        time_ms=$(echo "$time_total * 1000" | bc -l | cut -d. -f1)
        
        if [ "$http_code" = "200" ] || [ "$http_code" = "401" ]; then
            log_success "$name OK (${http_code}, ${time_ms}ms)"
            return 0
        else
            log_error "$name NG (HTTP $http_code)"
            return 1
        fi
    else
        log_error "$name 接続失敗"
        return 1
    fi
}

# 開発環境確認
check_dev() {
    log_info "🖥️  開発環境確認開始"
    echo "==============================="
    
    local errors=0
    
    # Docker サービス確認
    if docker-compose ps | grep -q "Up"; then
        log_success "Docker サービス起動中"
    else
        log_error "Docker サービス停止中"
        ((errors++))
    fi
    
    # localhost接続確認
    check_http "http://localhost:3000" "Next.js開発サーバー" || ((errors++))
    check_http "http://localhost:3003" "Docker Supabase" || ((errors++))
    
    # API確認
    check_http "http://localhost:3003/profiles" "プロフィールAPI" || ((errors++))
    check_http "http://localhost:3003/materials" "教材API" || ((errors++))
    
    # 品質チェック
    log_info "品質チェック実行中..."
    if npm run type-check > /dev/null 2>&1; then
        log_success "TypeScript型チェック"
    else
        log_error "TypeScript型チェック失敗"
        ((errors++))
    fi
    
    if npm run lint > /dev/null 2>&1; then
        log_success "ESLint"
    else
        log_error "ESLint失敗"
        ((errors++))
    fi
    
    echo "==============================="
    if [ $errors -eq 0 ]; then
        log_success "🖥️  開発環境確認完了 (エラー: 0件)"
        return 0
    else
        log_error "🖥️  開発環境確認完了 (エラー: ${errors}件)"
        return 1
    fi
}

# ステージング環境確認
check_staging() {
    log_info "🧪 ステージング環境確認開始"
    echo "==============================="
    
    local errors=0
    local base_url="https://staging.shiftwith.app"
    
    # 基本接続確認
    check_http "$base_url" "ステージングサイト" || ((errors++))
    
    # API確認
    check_http "$base_url/api/profiles" "プロフィールAPI" || ((errors++))
    check_http "$base_url/api/materials" "教材API" || ((errors++))
    
    # SSL証明書確認
    if echo | openssl s_client -connect staging.shiftwith.app:443 -servername staging.shiftwith.app 2>/dev/null | openssl x509 -noout -dates > /dev/null 2>&1; then
        log_success "SSL証明書有効"
    else
        log_warning "SSL証明書確認できず"
    fi
    
    # パフォーマンス確認
    log_info "パフォーマンス測定中..."
    response_time=$(curl -o /dev/null -s -w '%{time_total}' "$base_url")
    response_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)
    
    if [ "$(echo "$response_time < 3.0" | bc -l)" = 1 ]; then
        log_success "応答時間良好 (${response_ms}ms)"
    else
        log_warning "応答時間遅い (${response_ms}ms)"
    fi
    
    echo "==============================="
    if [ $errors -eq 0 ]; then
        log_success "🧪 ステージング環境確認完了 (エラー: 0件)"
        return 0
    else
        log_error "🧪 ステージング環境確認完了 (エラー: ${errors}件)"
        return 1
    fi
}

# 本番環境確認
check_production() {
    log_info "🚀 本番環境確認開始"
    echo "==============================="
    
    local errors=0
    local base_url="https://shiftwith-sigma.vercel.app"
    
    # 基本接続確認
    check_http "$base_url" "本番サイト" || ((errors++))
    
    # API確認
    check_http "$base_url/api/profiles" "プロフィールAPI" || ((errors++))
    check_http "$base_url/api/materials" "教材API" || ((errors++))
    
    # 重要ページ確認
    check_http "$base_url/dashboard" "ダッシュボード" || ((errors++))
    check_http "$base_url/materials" "教材一覧" || ((errors++))
    
    # SSL証明書確認
    if echo | openssl s_client -connect shiftwith-sigma.vercel.app:443 -servername shiftwith-sigma.vercel.app 2>/dev/null | openssl x509 -noout -dates > /dev/null 2>&1; then
        log_success "SSL証明書有効"
    else
        log_warning "SSL証明書確認できず"
    fi
    
    # パフォーマンス確認（本番は厳しい基準）
    log_info "パフォーマンス測定中..."
    response_time=$(curl -o /dev/null -s -w '%{time_total}' "$base_url")
    response_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)
    
    if [ "$(echo "$response_time < 1.0" | bc -l)" = 1 ]; then
        log_success "応答時間良好 (${response_ms}ms)"
    elif [ "$(echo "$response_time < 2.0" | bc -l)" = 1 ]; then
        log_warning "応答時間注意 (${response_ms}ms)"
    else
        log_error "応答時間問題 (${response_ms}ms)"
        ((errors++))
    fi
    
    # 最近のログ確認
    if command -v vercel > /dev/null 2>&1; then
        log_info "最近のログ確認中..."
        if recent_logs=$(vercel logs production --limit 10 2>/dev/null); then
            error_count=$(echo "$recent_logs" | grep -c "ERROR" || true)
            if [ "$error_count" -eq 0 ]; then
                log_success "最近のエラーなし"
            else
                log_warning "最近のエラー: ${error_count}件"
            fi
        else
            log_warning "ログ確認できず (vercel CLI未設定)"
        fi
    else
        log_warning "vercel CLI未インストール"
    fi
    
    echo "==============================="
    if [ $errors -eq 0 ]; then
        log_success "🚀 本番環境確認完了 (エラー: 0件)"
        return 0
    else
        log_error "🚀 本番環境確認完了 (エラー: ${errors}件)"
        return 1
    fi
}

# 全環境確認
check_all() {
    log_info "🌍 全環境確認開始"
    echo "==============================="
    
    local total_errors=0
    
    check_dev || ((total_errors++))
    echo
    check_staging || ((total_errors++))
    echo
    check_production || ((total_errors++))
    
    echo
    echo "=============================="
    log_info "🌍 全環境確認結果"
    
    if [ $total_errors -eq 0 ]; then
        log_success "全環境正常 (エラー: 0件)"
        return 0
    else
        log_error "環境エラーあり (エラー: ${total_errors}件)"
        return 1
    fi
}

# メイン処理
main() {
    local env=${1:-help}
    
    echo -e "${BLUE}"
    echo "🔍 環境別クイックチェックツール"
    echo "================================"
    echo -e "${NC}"
    
    case $env in
        "dev")
            check_dev
            ;;
        "staging")
            check_staging
            ;;
        "production")
            check_production
            ;;
        "all")
            check_all
            ;;
        "help"|*)
            echo "使用方法: $0 [環境]"
            echo ""
            echo "環境:"
            echo "  dev        - 🖥️  開発環境確認"
            echo "  staging    - 🧪 ステージング環境確認"
            echo "  production - 🚀 本番環境確認"
            echo "  all        - 🌍 全環境確認"
            echo ""
            echo "例:"
            echo "  $0 dev"
            echo "  $0 production"
            echo "  $0 all"
            exit 1
            ;;
    esac
}

# 必要コマンド確認
command -v curl > /dev/null || { log_error "curl が必要です"; exit 1; }
command -v bc > /dev/null || { log_error "bc が必要です"; exit 1; }

# スクリプト実行
main "$@"
