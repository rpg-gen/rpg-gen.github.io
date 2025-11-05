import DelveCard from "../types/delve_cards/DelveCard"

// Roll dice notation (e.g., "2d6" returns a number between 2 and 12)
function rollDice(notation: string): number {
    const match = notation.match(/^(\d+)d(\d+)$/i)
    if (!match) return 0

    const numDice = parseInt(match[1])
    const numSides = parseInt(match[2])

    let total = 0
    for (let i = 0; i < numDice; i++) {
        total += Math.floor(Math.random() * numSides) + 1
    }
    return total
}

// Safe mathematical expression evaluator using a simple recursive descent parser
function safeEvaluate(expr: string): number {
    let pos = 0

    function peek(): string {
        return expr[pos] || ''
    }

    function consume(): string {
        return expr[pos++] || ''
    }

    function parseNumber(): number {
        let num = ''
        while (peek() >= '0' && peek() <= '9' || peek() === '.') {
            num += consume()
        }
        const value = parseFloat(num)
        if (isNaN(value)) {
            throw new Error('Invalid number')
        }
        return value
    }

    function parseFactor(): number {
        if (peek() === '(') {
            consume() // '('
            const value = parseExpression()
            if (consume() !== ')') {
                throw new Error('Missing closing parenthesis')
            }
            return value
        }

        if (peek() === '-') {
            consume()
            return -parseFactor()
        }

        if (peek() === '+') {
            consume()
            return parseFactor()
        }

        return parseNumber()
    }

    function parseTerm(): number {
        let value = parseFactor()

        while (peek() === '*' || peek() === '/') {
            const op = consume()
            const right = parseFactor()
            if (op === '*') {
                value *= right
            } else {
                if (right === 0) {
                    throw new Error('Division by zero')
                }
                value /= right
            }
        }

        return value
    }

    function parseExpression(): number {
        let value = parseTerm()

        while (peek() === '+' || peek() === '-') {
            const op = consume()
            const right = parseTerm()
            if (op === '+') {
                value += right
            } else {
                value -= right
            }
        }

        return value
    }

    try {
        const result = parseExpression()
        if (pos < expr.length) {
            throw new Error('Unexpected characters after expression')
        }
        return result
    } catch (error) {
        console.error('Error evaluating expression:', expr, error)
        return 0
    }
}

// Evaluate a mathematical expression with dice rolls and variables
function evaluateExpression(expr: string, variables: Record<string, number> = {}): number {
    // First replace any variable references with their values
    let processedExpr = expr
    Object.entries(variables).forEach(([varName, value]) => {
        // Validate variable name to prevent injection
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(varName)) {
            console.error('Invalid variable name:', varName)
            return
        }
        // Ensure value is a valid number
        if (typeof value !== 'number' || !isFinite(value)) {
            console.error('Invalid variable value:', varName, value)
            return
        }
        // Use word boundaries to match whole variable names only
        const varPattern = new RegExp(`\\b${varName}\\b`, 'g')
        processedExpr = processedExpr.replace(varPattern, value.toString())
    })

    // Then replace all dice notation with their rolled values
    processedExpr = processedExpr.replace(/(\d+)d(\d+)/gi, (match) => {
        return rollDice(match).toString()
    })

    // Remove all whitespace
    processedExpr = processedExpr.replace(/\s/g, '')

    // Validate that expression only contains safe characters
    if (!/^[\d+\-*/().]+$/.test(processedExpr)) {
        console.error("Invalid expression - contains unsafe characters:", processedExpr)
        return 0
    }

    // Use safe parser instead of Function/eval and round to nearest integer
    return Math.round(safeEvaluate(processedExpr))
}

// Process a card's effect and description, rolling dice and handling variables
export function processCardText(card: DelveCard): { effect: string; description: string }
export function processCardText(effectText: string, descriptionText: string): { effect: string; description: string }
export function processCardText(
    cardOrEffect: DelveCard | string,
    descriptionText?: string
): { effect: string; description: string } {
    const variables: Record<string, number> = {}

    // Handle both function signatures
    let effectText: string
    let description: string

    if (typeof cardOrEffect === 'string') {
        effectText = cardOrEffect
        description = descriptionText || ''
    } else {
        effectText = cardOrEffect.effect
        description = cardOrEffect.description
    }

    // First pass: extract and evaluate variable assignments from effect sequentially
    // Pattern: <var_name = expression>
    let processedEffect = effectText
    const varAssignPattern = /<(\w+)\s*=\s*([^>]+)>/g
    let match: RegExpExecArray | null

    // Extract all variable assignments in order
    const assignments: Array<{ fullMatch: string; varName: string; expression: string }> = []
    while ((match = varAssignPattern.exec(effectText)) !== null) {
        assignments.push({
            fullMatch: match[0],
            varName: match[1],
            expression: match[2]
        })
    }

    // Evaluate each assignment sequentially, allowing later ones to use earlier variables
    assignments.forEach(({ fullMatch, varName, expression }) => {
        const value = evaluateExpression(expression, variables)
        variables[varName] = value
        // Remove the assignment from the effect text
        processedEffect = processedEffect.replace(fullMatch, '')
    })

    // Clean up any extra whitespace from removed assignments
    processedEffect = processedEffect.replace(/\s+/g, ' ').trim()

    // Second pass: replace variable references in effect
    Object.entries(variables).forEach(([varName, value]) => {
        const varPattern = new RegExp(`<${varName}>`, 'g')
        processedEffect = processedEffect.replace(varPattern, value.toString())
    })

    // Third pass: evaluate any remaining expressions in angle brackets
    // This handles things like <1d5 + 5>, <2d6 * 3>, etc.
    // Match any content in angle brackets that contains dice notation or math operations
    processedEffect = processedEffect.replace(/<([^>]+)>/g, (match, content) => {
        // Check if this looks like an expression (contains dice notation or operators)
        if (/\d+d\d+|[+\-*/]/.test(content)) {
            const value = evaluateExpression(content, variables)
            return value.toString()
        }
        // If it doesn't look like an expression, leave it as is
        return match
    })

    // Fourth pass: process description
    let processedDescription = description

    // Replace variable references with their values
    Object.entries(variables).forEach(([varName, value]) => {
        const varPattern = new RegExp(`<${varName}>`, 'g')
        processedDescription = processedDescription.replace(varPattern, value.toString())
    })

    // Evaluate any remaining expressions in angle brackets
    // This handles things like <1d5 + 5>, <2d6 * 3>, etc.
    processedDescription = processedDescription.replace(/<([^>]+)>/g, (match, content) => {
        // Check if this looks like an expression (contains dice notation or operators)
        if (/\d+d\d+|[+\-*/]/.test(content)) {
            const value = evaluateExpression(content, variables)
            return value.toString()
        }
        // If it doesn't look like an expression, leave it as is
        return match
    })

    return {
        effect: processedEffect,
        description: processedDescription
    }
}

