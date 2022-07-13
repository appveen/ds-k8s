const log4js = require('log4js');
const { exec } = require('child_process');
const rl = require('readline');

const logger = log4js.getLogger('k8s.utils');

async function getPods(namespace, deployment) {
    try {
        let cmd;
        if (namespace) {
            if (deployment) {
                cmd = `kubectl --insecure-skip-tls-verify get pods -n ${namespace} --selector=app=${deployment}`;
            } else {
                cmd = `kubectl --insecure-skip-tls-verify get pods -n ${namespace}`;
            }
        } else {
            cmd = `kubectl --insecure-skip-tls-verify get pods --all-namespaces`;
        }
        const rows = await runCommand(cmd);
        return rows;
    } catch (err) {
        logger.error(err);
        throw err;
    }
}

async function deletePod(namespace, podName) {
    if (!namespace || !podName) {
        throw new Error('Namespace and Pod Name is Requried');
    }
    await runCommand(`kubectl --insecure-skip-tls-verify delete pod -n ${namespace} ${podName}`);
}


async function getDeployments(namespace, deployment) {
    try {
        let cmd;
        if (namespace) {
            if (deployment) {
                cmd = `kubectl --insecure-skip-tls-verify get deploy -n ${namespace} ${deployment}`;
            } else {
                cmd = `kubectl --insecure-skip-tls-verify get deploy -n ${namespace}`;
            }
        } else {
            cmd = `kubectl --insecure-skip-tls-verify get deploy --all-namespaces`;
        }
        const rows = await runCommand(cmd);
        if (deployment) {
            return rows[0];
        }
        return rows;
    } catch (err) {
        logger.error(err);
        throw err;
    }
}

async function scaleDeployment(namespace, deployment, scaleValue) {
    if (!scaleValue) {
        scaleValue = 0;
    }
    if (!namespace || !deployment) {
        throw new Error('Namespace and Deployment is Requried');
    }
    await runCommand(`kubectl --insecure-skip-tls-verify scale deploy -n ${namespace} ${deployment} --replicas=${scaleValue}`);
}

async function getServices(namespace, deployment) {
    try {
        let cmd;
        if (namespace) {
            if (deployment) {
                cmd = `kubectl --insecure-skip-tls-verify get svc -n ${namespace} ${deployment}`;
            } else {
                cmd = `kubectl --insecure-skip-tls-verify get svc -n ${namespace}`;
            }
        } else {
            cmd = `kubectl --insecure-skip-tls-verify get svc --all-namespaces`;
        }
        const rows = await runCommand(cmd);
        if (deployment) {
            return rows[0];
        }
        return rows;
    } catch (err) {
        logger.error(err);
        throw err;
    }
}


function runCommand(cmd) {
    return new Promise((resolve, reject) => {
        try {
            let headers;
            const rows = [];
            const errors = [];
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
                if (rows.length == 0 && errors.length > 0) {
                    reject(new Error(errors.join('\n')));
                } else {
                    resolve(rows);
                }
            });
            cp.stderr.on('error', function (err) {
                reject(err);
            });
            cp.stderr.on('data', function (err) {
                errors.push(err);
            })
            cp.on('error', function (err) {
                reject(err);
            })
        } catch (err) {
            logger.error(err);
            reject(err);
        }
    });
}

function runCommandRaw(cmd) {
    return new Promise((resolve, reject) => {
        try {
            const rows = [];
            const cp = exec(cmd);
            const readInterface = rl.createInterface(cp.stdout);
            readInterface.on('line', function (line) {
                rows.push(line);
            });
            readInterface.on('close', function () {
                resolve(rows.join('\n'));
            });
        } catch (err) {
            reject(err);
        }
    });
}


module.exports = {
    getPods,
    deletePod,
    getDeployments,
    scaleDeployment,
    getServices,
    runCommand,
    runCommandRaw
};