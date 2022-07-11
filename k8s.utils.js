const { exec } = require('child_process');
const rl = require('readline');


async function getPods(namespace, deployment) {
    try {
        let cmd;
        if (namespace) {
            if (deployment) {
                cmd = `kubectl get pods -n ${namespace} ${deployment}`;
            } else {
                cmd = `kubectl get pods -n ${namespace}`;
            }
        } else {
            cmd = `kubectl get pods --all-namespaces`;
        }
        const rows = await runCommand(cmd);
        return rows;
    } catch (err) {

    }
}


async function getDeployments(namespace, deployment) {
    try {
        let cmd;
        if (namespace) {
            if (deployment) {
                cmd = `kubectl get deploy -n ${namespace} ${deployment}`;
            } else {
                cmd = `kubectl get deploy -n ${namespace}`;
            }
        } else {
            cmd = `kubectl get deploy --all-namespaces`;
        }
        const rows = await runCommand(cmd);
        if (deployment) {
            return rows[0];
        }
        return rows;
    } catch (err) {

    }
}

async function getServices(namespace, deployment) {
    try {
        let cmd;
        if (namespace) {
            if (deployment) {
                cmd = `kubectl get svc -n ${namespace} ${deployment}`;
            } else {
                cmd = `kubectl get svc -n ${namespace}`;
            }
        } else {
            cmd = `kubectl get svc --all-namespaces`;
        }
        const rows = await runCommand(cmd);
        if (deployment) {
            return rows[0];
        }
        return rows;
    } catch (err) {

    }
}


function runCommand(cmd) {
    return new Promise((resolve, reject) => {
        try {
            let headers;
            const rows = [];
            const cp = exec(cmd);
            const readInterface = rl.createInterface(cp.stdout);
            readInterface.on('line', function (line) {
                const values = line.split(' ').filter(e => e);
                if (!headers) {
                    headers = values;
                } else {
                    const temp = {};
                    headers.forEach((e, i) => {
                        temp[e] = values[i];
                    });
                    rows.push(temp);
                }
            });
            readInterface.on('close', function () {
                resolve(rows);
            });
        } catch (err) {
            reject(err);
        }
    });
}



module.exports = {
    getPods,
    getDeployments,
    getServices,
    runCommand
};