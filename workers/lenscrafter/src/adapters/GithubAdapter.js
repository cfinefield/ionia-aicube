
import { Octokit } from "octokit";

export const GithubAdapter = {
    /**
     * Creates a Pull Request with the specified changes.
     * @param {string} repoUrl - Full URL to repo or file (e.g., https://github.com/org/repo/blob/main/file.json)
     * @param {string} fileContent - New content for the file
     * @param {string} message - Commit message / PR Title
     * @param {string} token - GitHub PAT
     */
    async createPullRequest(repoUrl, fileContent, message, token) {
        if (!token) throw new Error("GitHub Token required");

        // Parse Owner/Repo/Path from URL
        // Expected format: https://github.com/owner/repo/blob/branch/path/to/file
        const urlParts = new URL(repoUrl).pathname.split('/');
        const owner = urlParts[1];
        const repo = urlParts[2];
        const branch = 'main'; // Simplification: assume main or extract from URL if present
        const path = urlParts.slice(5).join('/'); // /blob/branch/...

        const octokit = new Octokit({ auth: token });

        // 1. Get SHA of current file (to allow update) and base tree
        let sha;
        try {
            const { data } = await octokit.rest.repos.getContent({ owner, repo, path, ref: branch });
            sha = data.sha;
        } catch (e) {
            // File might not exist, which is fine for new files
        }

        // 2. Create a new branch
        const newBranchName = `lenscrafter-update-${Date.now()}`;
        const { data: refData } = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${branch}` });
        const baseSha = refData.object.sha;

        await octokit.rest.git.createRef({
            owner, repo, ref: `refs/heads/${newBranchName}`, sha: baseSha
        });

        // 3. Update/Create File
        await octokit.rest.repos.createOrUpdateFileContents({
            owner, repo, path,
            message,
            content: btoa(unescape(encodeURIComponent(fileContent))), // Base64 encode
            branch: newBranchName,
            sha
        });

        // 4. Create PR
        const { data: pr } = await octokit.rest.pulls.create({
            owner, repo,
            title: message,
            head: newBranchName,
            base: branch,
            body: `Automated update via LensCrafter (AI Rail).`
        });

        return { params: { owner, repo, path }, pr: pr.html_url };
    }
};
