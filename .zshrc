export EDITOR=vim
export VISUAL=vim

# Enable Ctrl+X Ctrl+E to edit command line in $EDITOR
autoload -U edit-command-line
zle -N edit-command-line
bindkey '^X^E' edit-command-line

# use vi for edit mode
bindkey -v

# Added by Antigravity
export PATH="/Users/david/.antigravity/antigravity/bin:$PATH"

# reverse seardh
bindkey '^R' history-incremental-search-backward

test -e "${HOME}/.iterm2_shell_integration.zsh" && source "${HOME}/.iterm2_shell_integration.zsh"

precmd() {
    local project=""
    if git rev-parse --is-inside-work-tree &>/dev/null; then
        project=$(basename "$(git remote get-url origin 2>/dev/null | sed 's/\.git$//')" 2>/dev/null)
        [ -z "$project" ] && project=$(basename "$(git rev-parse --show-toplevel 2>/dev/null)")
    fi
    if [ -n "$project" ]; then
        echo -ne "\e]1;${project}\a"
    else
        echo -ne "\e]1;${PWD##*/}\a"
    fi
}
